import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskStockService } from '../kioskStockService';

import type { KioskStock } from '../components/KioskDetail/KioskStockGrid/kioskStock.types';
import type { Kiosk } from '../types';


export type UseKioskStockDeleteArgs = {
	kiosk: Kiosk,
	onSuccess?: () => void,
	onError?: () => void,
};

export function useKioskStockDelete(
	{ kiosk, onSuccess = () => {}, onError = () => {} }: UseKioskStockDeleteArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer(kioskStockService.delete);
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
				translate('errors.deleteFailed'),
				translate('messages.error'),
			);
			return;
		}
		// Nested resource — `[request, kioskId]`, not a bare object.
		dispatchMethod([{ id: deleteStock.id }, kiosk.id]);
	}, [deleteStock, dispatchMethod, kiosk.id, notification, translate]);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_stock.delete.success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { closeDeleteModal(); onSuccess(); },
		onError: () => { closeDeleteModal(); onError(); },
	});

	return {
		deleteStock,
		isOpenDeleteModal,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
		isDeleting: result.isPending,
	};
}
