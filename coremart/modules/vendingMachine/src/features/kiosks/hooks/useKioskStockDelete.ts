/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	kioskActions,
	selectKioskStockDelete,
	VendingMachineDispatch,
} from '@/appState';
import { KioskStock } from '@/features/kiosks/components/KioskDetail/KioskStockGrid/kioskStock.types';
import { Kiosk } from '@/features/kiosks/types';
import { RestDeleteResponse } from '@/types';


export type UseKioskStockDeleteArgs = {
	kiosk: Kiosk;
	onSuccess?: () => void;
	onError?: () => void;
};

function useKioskStockDeleteOutcomeSync(
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
				translate('coremart.vendingMachine.kioskStock.delete.success', {
					defaultValue: 'Kiosk product line removed',
				}),
				translate('nikki.general.messages.success'),
			);
			onClose();
			onDeleteSuccess?.();
			dispatch(kioskActions.resetKioskStockDelete());
			return;
		}
		if (deleteState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			onDeleteError?.();
			dispatch(kioskActions.resetKioskStockDelete());
		}
	}, [
		deleteState, dispatch, notification, translate, onClose, onDeleteSuccess, onDeleteError,
		dispatchedRequestIdRef,
	]);
}

export function useKioskStockDelete(
	{ kiosk, onSuccess, onError = () => {} }: UseKioskStockDeleteArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectKioskStockDelete);
	const dispatchedRequestIdRef = React.useRef<string | null>(null);
	const [deleteStock, setDeleteStock] = useState<KioskStock | null>(null);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

	const closeDeleteModal = useCallback(() => {
		setDeleteStock(null);
		setIsOpenDeleteModal(false);
	}, []);
	const openDeleteModal = useCallback((stock: KioskStock) => {
		setDeleteStock(stock);
		setIsOpenDeleteModal(true);
	}, []);

	const confirmDelete = useCallback(() => {
		if (!kiosk.id || !deleteStock?.id) {
			notification.showError(
				translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			return;
		}
		const pending = dispatch(
			kioskActions.deleteKioskStock({ kioskId: kiosk.id, stockId: deleteStock.id }),
		);
		dispatchedRequestIdRef.current = pending.requestId;
	}, [deleteStock, dispatch, kiosk.id, notification, translate]);


	const onDeleteSuccess = useCallback(() => {
		closeDeleteModal();
		onSuccess?.();
	}, [closeDeleteModal, onSuccess]);

	const onDeleteError = useCallback(() => {
		closeDeleteModal();
		onError?.();
	}, [closeDeleteModal, onError]);

	useKioskStockDeleteOutcomeSync(
		deleteState,
		dispatchedRequestIdRef,
		dispatch,
		notification,
		translate,
		closeDeleteModal,
		onDeleteSuccess,
		onDeleteError,
	);

	return {
		deleteStock,
		isOpenDeleteModal,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
		isDeleting: deleteState.status === 'pending',
	};
}
