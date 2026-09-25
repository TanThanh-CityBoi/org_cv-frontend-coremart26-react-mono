import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { eventStockCrudService } from '../eventStockService';

import type { EventStock } from '../types';


export type UseEventStockDeleteArgs = {
	onSuccess?: () => void,
	onError?: () => void,
};

export function useEventStockDelete(
	{ onSuccess = () => {}, onError = () => {} }: UseEventStockDeleteArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer(eventStockCrudService.delete);
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
				translate('errors.deleteFailed'),
				translate('messages.error'),
			);
			return;
		}
		dispatchMethod({ id: deleteStock.id });
	}, [deleteStock, dispatchMethod, notification, translate]);

	useMutationOutcome(result, {
		successKey: () => 'event_stock.delete.success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { closeDeleteModal(); onSuccess(); },
		onError: () => { closeDeleteModal(); onError(); },
	});

	return {
		deleteStock,
		isDeleteModalOpen: deleteStock != null,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
		isDeleting: result.isPending,
	};
}
