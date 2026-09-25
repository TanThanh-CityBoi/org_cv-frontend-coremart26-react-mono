/* eslint-disable max-lines-per-function */

import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { kioskActions, selectCreateKioskStock, VendingMachineDispatch } from '@/appState';
import { CreateKioskStockRequest } from '@/features/kiosks/kioskSlice';
import { RestCreateResponse } from '@/types';

import { Kiosk } from '../types';



export type CreateKioskStockFormPayload = {
	productRef: string;
	sortIndex: number;
	sellPrice: number;
	warningQuantity?: number;
};

export type UseCreateKioskStockArgs = {
	kiosk: Kiosk;
	/** Gọi sau khi tạo thành công (vd. `fetchKioskStocks`). */
	onSuccess?: () => void;
	onError?: () => void;
};

function useCreateKioskStockOutcomeSync(
	createState: ReduxActionState<RestCreateResponse>,
	requestIdRef: RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onClose: () => void,
	onSuccess?: () => void,
	onError?: () => void,
) {
	useEffect(() => {
		const requestId = createState.requestId;
		const matchesDispatch = requestId != null && requestIdRef.current === requestId;
		if (!matchesDispatch) {
			return;
		}
		if (createState.status === 'success') {
			requestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.kioskStock.create.success', {
					defaultValue: 'Product added to kiosk',
				}),
				translate('nikki.general.messages.success'),
			);

			onClose();
			onSuccess?.();
			dispatch(kioskActions.resetCreateKioskStock());
			return;
		}
		if (createState.status === 'error') {
			requestIdRef.current = null;
			notification.showError(
				createState.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			onError?.();
			onClose?.();
			dispatch(kioskActions.resetCreateKioskStock());
		}
	}, [createState, dispatch, notification, translate, onClose, onSuccess, onError, requestIdRef]);
}

export function useCreateKioskStock(
	{ kiosk, onSuccess, onError = () => {} }: UseCreateKioskStockArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createState = useMicroAppSelector(selectCreateKioskStock);
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
		async (payloads: CreateKioskStockFormPayload[]) => {
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
			const firstItem = list[0];
			const body: CreateKioskStockRequest = {
				kioskId: kiosk.id,
				productRef: firstItem.productRef,
				sortIndex: firstItem.sortIndex,
				sellPrice: String(firstItem.sellPrice),
				warningQuantity: firstItem.warningQuantity,
			};
			const pending = dispatch(kioskActions.createKioskStock(body));
			requestIdRef.current = pending.requestId;
		},
		[dispatch, handleCloseModal, kiosk.id, notification, onError, onSuccess, translate],
	);

	useCreateKioskStockOutcomeSync(
		createState,
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
