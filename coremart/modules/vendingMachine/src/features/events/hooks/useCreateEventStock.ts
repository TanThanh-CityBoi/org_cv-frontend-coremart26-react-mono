import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { eventStockCrudService } from '../eventStockService';

import type { RestCreateResponse } from '../../../types';


export type CreateEventStockFormPayload = {
	productRef: string,
	sellPrice: number,
};

export type UseCreateEventStockArgs = {
	event: { id?: string },
	onSuccess?: () => void,
	onError?: () => void,
};

export function useCreateEventStock(
	{ event, onSuccess = () => {}, onError = () => {} }: UseCreateEventStockArgs,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const [isOpen, setIsOpen] = useState(false);
	const { dispatchMethod, result } = useServiceLayer<RestCreateResponse[]>(eventStockCrudService.bulkCreate);

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
					translate('errors.createFailed'),
					translate('messages.error'),
				);
				return;
			}
			dispatchMethod({
				eventId: event.id,
				items: list.map((p) => ({ productRef: p.productRef, sellPrice: String(p.sellPrice) })),
			});
		},
		[dispatchMethod, event.id, notification, translate],
	);

	useMutationOutcome(result, {
		successKey: () => ((result.data?.length ?? 0) > 1
			? 'event_stock.create.success_many'
			: 'event_stock.create.success'),
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
