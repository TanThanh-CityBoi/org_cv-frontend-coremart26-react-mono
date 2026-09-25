import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskStockService } from '../kioskStockService';

import type { KioskStock } from '../components/KioskDetail/KioskStockGrid/kioskStock.types';
import type { Kiosk } from '../types';


export type KioskStockUpdateFormPayload = {
	sortIndex: number,
	sellPrice: number,
	warningQuantity?: number,
};

export type UseKioskStockUpdateArgs = {
	kiosk: Kiosk,
	onSuccess?: () => void,
	onError?: () => void,
};

export function useKioskStockUpdate(
	{ kiosk, onSuccess = () => {}, onError = () => {} }: UseKioskStockUpdateArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer(kioskStockService.update);
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
					translate('errors.updateFailed'),
					translate('messages.error'),
				);
				return;
			}
			const etag = editStock.etag;
			if (etag == null || etag === '') {
				notification.showError(
					translate('kiosk_stock.update.missing_etag', {
						defaultValue: 'Missing stock version (etag). Refresh and try again.',
					}),
					translate('messages.error'),
				);
				return;
			}
			// Nested resource — `[request, kioskId]`, not a bare object.
			dispatchMethod([
				{ id: editStock.id, etag, sortIndex, sellPrice: String(sellPrice), warningQuantity },
				kiosk.id,
			]);
		},
		[dispatchMethod, editStock, kiosk.id, notification, translate],
	);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_stock.update.success',
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
