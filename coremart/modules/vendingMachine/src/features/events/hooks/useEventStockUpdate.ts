/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { eventStockCrudService } from '../eventStockService';

import type { Event, EventStock } from '../types';


export type EventStockUpdateFormPayload = {
	sellPrice: number,
};

export type UseEventStockUpdateArgs = {
	event: Event,
	onSuccess?: () => void,
	onError?: () => void,
};

export function useEventStockUpdate(
	{ event, onSuccess = () => {}, onError = () => {} }: UseEventStockUpdateArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer(eventStockCrudService.update);
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
					translate('errors.updateFailed'),
					translate('messages.error'),
				);
				return;
			}
			const etag = editStock.etag;
			if (etag == null || etag === '') {
				notification.showError(
					translate('event_stock.update.missing_etag', {
						defaultValue: 'Missing stock version (etag). Refresh and try again.',
					}),
					translate('messages.error'),
				);
				return;
			}
			dispatchMethod({
				id: editStock.id,
				etag,
				eventRef: event.id,
				productRef: editStock.productRef,
				sellPrice: String(sellPrice),
			});
		},
		[dispatchMethod, editStock, event.id, notification, translate],
	);

	useMutationOutcome(result, {
		successKey: () => 'event_stock.update.success',
		errorKey: 'errors.updateFailed',
		onSuccess: () => { handleCloseEditModal(); onSuccess(); },
		onError: () => { handleCloseEditModal(); onError(); },
	});

	return {
		editStock,
		isEditModalOpen: editStock != null,
		openEditModal,
		closeEditModal: handleCloseEditModal,
		handleSubmit,
		isSubmitting: result.isPending,
	};
}
