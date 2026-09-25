import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskStockService } from '../kioskStockService';
import { Kiosk } from '../types';


export type CreateKioskStockFormPayload = {
	productRef: string,
	sortIndex: number,
	sellPrice: number,
	warningQuantity?: number,
};

export type UseCreateKioskStockArgs = {
	kiosk: Kiosk,
	/** Gọi sau khi tạo thành công (vd. `fetchKioskStocks`). */
	onSuccess?: () => void,
	onError?: () => void,
};

export function useCreateKioskStock(
	{ kiosk, onSuccess = () => {}, onError = () => {} }: UseCreateKioskStockArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const [isOpen, setIsOpen] = useState(false);
	const { dispatchMethod, result } = useServiceLayer(kioskStockService.create);

	const handleCloseModal = useCallback(() => {
		setIsOpen(false);
	}, []);

	const handleOpenCreateModal = useCallback(() => {
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
					translate('errors.createFailed'),
					translate('messages.error'),
				);
				return;
			}
			// Only the first row: this hook creates one stock, `useCreateKioskStockBulk` many.
			const [first] = list;
			// Nested resource — `[request, kioskId]`, not a bare object.
			dispatchMethod([
				{
					productRef: first.productRef,
					sortIndex: first.sortIndex,
					sellPrice: String(first.sellPrice),
					warningQuantity: first.warningQuantity,
				},
				kiosk.id,
			]);
		},
		[dispatchMethod, kiosk.id, notification, translate],
	);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_stock.create.success',
		errorKey: 'errors.createFailed',
		onSuccess: () => { handleCloseModal(); onSuccess(); },
		onError: () => { handleCloseModal(); onError(); },
	});

	return {
		isOpenCreateModal: isOpen,
		handleOpenCreateModal,
		handleCloseModal,
		handleSubmit,
		isSubmitting: result.isPending,
	};
}
