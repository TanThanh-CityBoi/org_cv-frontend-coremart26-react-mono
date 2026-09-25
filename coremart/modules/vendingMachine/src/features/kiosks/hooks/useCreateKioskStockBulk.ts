import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskStockService } from '../kioskStockService';
import { Kiosk } from '../types';

import type { CreateKioskStockFormPayload } from './useCreateKioskStock';
import type { RestCreateResponse } from '../../../types';


export type UseCreateKioskStockBulkArgs = {
	kiosk: Kiosk,
	onSuccess?: () => void,
	onError?: () => void,
};

export function useCreateKioskStockBulk(
	{ kiosk, onSuccess = () => {}, onError = () => {} }: UseCreateKioskStockBulkArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const [isOpen, setIsOpen] = useState(false);
	const { dispatchMethod, result } = useServiceLayer<RestCreateResponse[]>(kioskStockService.bulkCreate);

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
			// `bulkCreate` is a bespoke method, so the kiosk id rides inside the request object
			// rather than as a trailing `primaryResourceId`.
			dispatchMethod({
				kioskId: kiosk.id,
				items: list.map((p) => ({
					productRef: p.productRef,
					sortIndex: p.sortIndex,
					sellPrice: String(p.sellPrice),
					warningQuantity: p.warningQuantity,
				})),
			});
		},
		[dispatchMethod, kiosk.id, notification, translate],
	);

	useMutationOutcome(result, {
		successKey: () => ((result.data?.length ?? 0) > 1
			? 'kiosk_stock.create.success_many'
			: 'kiosk_stock.create.success'),
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
