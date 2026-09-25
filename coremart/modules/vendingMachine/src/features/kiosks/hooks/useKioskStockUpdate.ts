/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	kioskActions,
	selectKioskStockUpdate,
	VendingMachineDispatch,
} from '@/appState';
import { KioskStock } from '@/features/kiosks/components/KioskDetail/KioskStockGrid/kioskStock.types';
import { UpdateKioskStockRequest } from '@/features/kiosks/kioskSlice';
import { Kiosk } from '@/features/kiosks/types';
import { RestUpdateResponse } from '@/types';


export type KioskStockUpdateFormPayload = {
	sortIndex: number;
	sellPrice: number;
	warningQuantity?: number;
};

export type UseKioskStockUpdateArgs = {
	kiosk: Kiosk;
	onSuccess?: () => void;
	onError?: () => void;
};

function useKioskStockUpdateOutcomeSync(
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
				translate('coremart.vendingMachine.kioskStock.update.success', {
					defaultValue: 'Kiosk product line updated',
				}),
				translate('nikki.general.messages.success'),
			);
			onClose();
			onUpdateSuccess?.();
			dispatch(kioskActions.resetKioskStockUpdate());
			return;
		}
		if (updateState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			notification.showError(
				updateState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			onUpdateError?.();
			dispatch(kioskActions.resetKioskStockUpdate());
		}
	}, [
		updateState, dispatch, notification, translate, onClose, onUpdateSuccess, onUpdateError,
		dispatchedRequestIdRef,
	]);
}

export function useKioskStockUpdate(
	{ kiosk, onSuccess, onError = () => {} }: UseKioskStockUpdateArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const updateState = useMicroAppSelector(selectKioskStockUpdate);
	const dispatchedRequestIdRef = React.useRef<string | null>(null);
	const [editStock, setEditStock] = useState<KioskStock | null>(null);

	const handleCloseEditModal = useCallback(() => {
		setEditStock(null);
	}, []);

	const openEditModal = useCallback((stock: KioskStock) => {
		setEditStock(stock);
	}, []);

	const handleSubmit = useCallback(
		({ sortIndex, sellPrice, warningQuantity }: KioskStockUpdateFormPayload) => {
			if (!kiosk.id || !editStock?.id) {
				notification.showError(
					translate('nikki.general.errors.update_failed'),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			const etag = editStock.etag;
			if (etag == null || etag === '') {
				notification.showError(
					translate('coremart.vendingMachine.kioskStock.update.missing_etag', {
						defaultValue: 'Missing stock version (etag). Refresh and try again.',
					}),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			const body: UpdateKioskStockRequest = {
				kioskId: kiosk.id,
				stockId: editStock.id,
				etag,
				sortIndex,
				sellPrice: String(sellPrice),
				warningQuantity: warningQuantity,
			};
			const pending = dispatch(kioskActions.updateKioskStock(body));
			dispatchedRequestIdRef.current = pending.requestId;
		},
		[dispatch, editStock, kiosk.id, notification, translate],
	);

	useKioskStockUpdateOutcomeSync(
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
