import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	eventActions,
	selectEventStockDelete,
	VendingMachineDispatch,
} from '@/appState';

import type { EventStock } from '@/features/events/types';
import type { RestDeleteResponse } from '@/types';


export type UseEventStockDeleteArgs = {
	onSuccess?: () => void;
	onError?: () => void;
};

function useEventStockDeleteOutcomeSync(
	deleteState: ReduxActionState<RestDeleteResponse>,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onClose: () => void,
	onDeleteSuccess?: () => void,
	onDeleteError?: () => void,
) {
	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) {
			return;
		}
		if (deleteState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.eventStock.delete.success', {
					defaultValue: 'Event product line removed',
				}),
				translate('nikki.general.messages.success'),
			);
			onClose();
			onDeleteSuccess?.();
			dispatch(eventActions.resetEventStockDelete());
			return;
		}
		if (deleteState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			onDeleteError?.();
			dispatch(eventActions.resetEventStockDelete());
		}
	}, [
		deleteState, dispatch, notification, translate, onClose, onDeleteSuccess, onDeleteError,
		dispatchedRequestIdRef,
	]);
}

export function useEventStockDelete(
	{ onSuccess, onError = () => {} }: UseEventStockDeleteArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectEventStockDelete);
	const dispatchedRequestIdRef = React.useRef<string | null>(null);
	const [deleteStock, setDeleteStock] = useState<EventStock | null>(null);

	const closeDeleteModal = useCallback(() => {
		setDeleteStock(null);
	}, []);

	const openDeleteModal = useCallback((stock: EventStock) => {
		setDeleteStock(stock);
	}, []);

	const confirmDelete = useCallback(() => {
		if (!deleteStock?.id) {
			notification.showError(
				translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			return;
		}
		const pending = dispatch(eventActions.deleteEventStock({
			eventId: deleteStock.eventRef,
			stockId: deleteStock.id,
		}));
		dispatchedRequestIdRef.current = pending.requestId;
	}, [deleteStock, dispatch, notification, translate]);

	useEventStockDeleteOutcomeSync(
		deleteState,
		dispatchedRequestIdRef,
		dispatch,
		notification,
		translate,
		closeDeleteModal,
		onSuccess,
		onError,
	);

	return {
		deleteStock,
		isDeleteModalOpen: deleteStock != null,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
		isDeleting: deleteState.status === 'pending',
	};
}
