/* eslint-disable max-lines-per-function */

import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	eventActions,
	selectBulkCreateEventStock,
	VendingMachineDispatch,
} from '@/appState';

import type { BulkCreateEventStocksRequest } from '@/features/events/eventSlice';
import type { RestCreateResponse } from '@/types';


export type CreateEventStockFormPayload = {
	productRef: string;
	sellPrice: number;
};

export type UseCreateEventStockArgs = {
	event: { id?: string };
	onSuccess?: () => void;
	onError?: () => void;
};

function useCreateEventStocksBulkOutcomeSync(
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
					? translate('coremart.vendingMachine.eventStock.create.successMany', {
						defaultValue: 'Products added to event',
					})
					: translate('coremart.vendingMachine.eventStock.create.success', {
						defaultValue: 'Product added to event',
					}),
				translate('nikki.general.messages.success'),
			);
			onClose();
			onSuccess?.();
			dispatch(eventActions.resetBulkCreateEventStock());
			return;
		}
		if (bulkState.status === 'error') {
			requestIdRef.current = null;
			notification.showError(
				bulkState.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			onError?.();
			dispatch(eventActions.resetBulkCreateEventStock());
		}
	}, [bulkState, dispatch, notification, translate, onClose, onSuccess, onError, requestIdRef]);
}

export function useCreateEventStock(
	{ event, onSuccess, onError = () => {} }: UseCreateEventStockArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const [isOpen, setIsOpen] = useState(false);
	const bulkState = useMicroAppSelector(selectBulkCreateEventStock);
	const requestIdRef = useRef<string | null>(null);

	const handleCloseModal = useCallback(() => {
		setIsOpen(false);
	}, []);

	const handleOpenCreateModal = useCallback(() => {
		setIsOpen(true);
	}, []);

	const handleSubmit = useCallback(
		(payloads: CreateEventStockFormPayload[]) => {
			const list = payloads.filter((p) => p.productRef !== '');
			if (list.length === 0) {
				return;
			}
			if (!event.id) {
				notification.showError(
					translate('nikki.general.errors.create_failed'),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			const items = list.map((p) => ({
				productRef: p.productRef,
				sellPrice: String(p.sellPrice),
			}));
			const body: BulkCreateEventStocksRequest = { eventId: event.id, items };
			const pending = dispatch(eventActions.bulkCreateEventStock(body));
			requestIdRef.current = pending.requestId;
		},
		[dispatch, event.id, notification, translate],
	);

	useCreateEventStocksBulkOutcomeSync(
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
		isSubmitting: bulkState.status === 'pending',
	};
}
