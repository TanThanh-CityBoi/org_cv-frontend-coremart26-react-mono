/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	eventActions,
	selectEventStockUpdate,
	VendingMachineDispatch,
} from '@/appState';

import { UpdateEventStockBody } from '../eventStockService';

import type { Event, EventStock } from '@/features/events/types';
import type { RestUpdateResponse } from '@/types';


export type EventStockUpdateFormPayload = {
	sellPrice: number;
};

export type UseEventStockUpdateArgs = {
	event: Event;
	onSuccess?: () => void;
	onError?: () => void;
};

function useEventStockUpdateOutcomeSync(
	updateState: ReduxActionState<RestUpdateResponse>,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onClose: () => void,
	onUpdateSuccess?: () => void,
	onUpdateError?: () => void,
) {
	React.useEffect(() => {
		const requestId = updateState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) {
			return;
		}
		if (updateState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.eventStock.update.success', {
					defaultValue: 'Event product line updated',
				}),
				translate('nikki.general.messages.success'),
			);
			onClose();
			onUpdateSuccess?.();
			dispatch(eventActions.resetEventStockUpdate());
			return;
		}
		if (updateState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			onUpdateError?.();
			dispatch(eventActions.resetEventStockUpdate());
		}
	}, [
		updateState, dispatch, notification, translate, onClose, onUpdateSuccess, onUpdateError,
		dispatchedRequestIdRef,
	]);
}

export function useEventStockUpdate(
	{ event, onSuccess, onError = () => {} }: UseEventStockUpdateArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const updateState = useMicroAppSelector(selectEventStockUpdate);
	const dispatchedRequestIdRef = React.useRef<string | null>(null);
	const [editStock, setEditStock] = useState<EventStock | null>(null);

	const handleCloseEditModal = useCallback(() => {
		setEditStock(null);
	}, []);

	const openEditModal = useCallback((stock: EventStock) => {
		setEditStock(stock);
	}, []);

	const handleSubmit = useCallback(
		({ sellPrice }: EventStockUpdateFormPayload) => {
			if (!event.id || !editStock?.id) {
				notification.showError(
					translate('nikki.general.errors.update_failed'),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			const etag = editStock.etag;
			if (etag == null || etag === '') {
				notification.showError(
					translate('coremart.vendingMachine.eventStock.update.missing_etag', {
						defaultValue: 'Missing stock version (etag). Refresh and try again.',
					}),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			const body: UpdateEventStockBody = {
				id: editStock.id,
				etag,
				eventRef: event.id,
				productRef: editStock.productRef,
				sellPrice: String(sellPrice),
			};
			const pending = dispatch(eventActions.updateEventStock(body));
			dispatchedRequestIdRef.current = pending.requestId;
		},
		[dispatch, editStock, event.id, notification, translate],
	);

	useEventStockUpdateOutcomeSync(
		updateState,
		dispatchedRequestIdRef,
		dispatch,
		notification,
		translate,
		handleCloseEditModal,
		onSuccess,
		onError,
	);

	return {
		editStock,
		isEditModalOpen: editStock != null,
		openEditModal,
		closeEditModal: handleCloseEditModal,
		handleSubmit,
		isSubmitting: updateState.status === 'pending',
	};
}
