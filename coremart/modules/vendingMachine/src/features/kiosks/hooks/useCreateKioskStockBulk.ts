/* eslint-disable max-lines-per-function */

import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


import {
	kioskActions,
	selectBulkCreateKioskStocks,
	VendingMachineDispatch,
} from '@/appState';
import { BulkCreateKioskStocksRequest } from '@/features/kiosks/kioskSlice';
import { RestCreateResponse } from '@/types';

import { Kiosk } from '../types';
import { CreateKioskStockFormPayload } from './useCreateKioskStock';



export type UseCreateKioskStockBulkArgs = {
	kiosk: Kiosk;
	onSuccess?: () => void;
	onError?: () => void;
};

function useCreateKioskStocksBulkOutcomeSync(
	bulkState: ReduxActionState<RestCreateResponse[]>,
	requestIdRef: RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onClose: () => void,
	onSuccess?: () => void,
	onError?: () => void,
) {
	useEffect(() => {
		const requestId = bulkState.requestId;
		const matchesDispatch = requestId != null && requestIdRef.current === requestId;
		if (!matchesDispatch) {
			return;
		}
		if (bulkState.status === 'success') {
			requestIdRef.current = null;
			const count = bulkState.data?.length ?? 0;
			notification.showInfo(
				count > 1
					? translate('coremart.vendingMachine.kioskStock.create.successMany', {
						defaultValue: 'Products added to kiosk',
					})
					: translate('coremart.vendingMachine.kioskStock.create.success', {
						defaultValue: 'Product added to kiosk',
					}),
				translate('nikki.general.messages.success'),
			);
			onClose();
			onSuccess?.();
			dispatch(kioskActions.resetBulkCreateKioskStocks());
			return;
		}
		if (bulkState.status === 'error') {
			requestIdRef.current = null;
			notification.showError(
				bulkState.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			onError?.();
			onClose?.();
			dispatch(kioskActions.resetBulkCreateKioskStocks());
		}
	}, [bulkState, dispatch, notification, translate, onClose, onSuccess, onError, requestIdRef]);
}

export function useCreateKioskStockBulk(
	{ kiosk, onSuccess, onError = () => {} }: UseCreateKioskStockBulkArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const bulkState = useMicroAppSelector(selectBulkCreateKioskStocks);
	const requestIdRef = useRef<string | null>(null);

	const handleCloseModal = useCallback(() => {
		setIsSubmitting(false);
		setIsOpen(false);
	}, []);

	const handleOpenCreateModal = useCallback(() => {
		setIsSubmitting(false);
		setIsOpen(true);
	}, []);

	const handleSubmit = useCallback(
		(payloads: CreateKioskStockFormPayload[]) => {
			const list = payloads.filter((p) => p.productRef !== '');
			if (list.length === 0) {
				return;
			}
			if (!kiosk.id) {
				notification.showError(
					translate('nikki.general.errors.create_failed'),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			setIsSubmitting(true);
			const items = list.map((p) => ({
				productRef: p.productRef,
				sortIndex: p.sortIndex,
				sellPrice: String(p.sellPrice),
				warningQuantity: p.warningQuantity,
			}));
			const body: BulkCreateKioskStocksRequest = { kioskId: kiosk.id, items };
			const pending = dispatch(kioskActions.bulkCreateKioskStocks(body));
			requestIdRef.current = pending.requestId;
		},
		[dispatch, kiosk.id, notification, translate],
	);

	useCreateKioskStocksBulkOutcomeSync(
		bulkState,
		requestIdRef,
		dispatch,
		notification,
		translate,
		handleCloseModal,
		onSuccess,
		onError,
	);

	return {
		isOpenCreateModal: isOpen,
		handleOpenCreateModal,
		handleCloseModal,
		handleSubmit,
		isSubmitting,
	};
}
