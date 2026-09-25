import { notifications } from '@mantine/notifications';
import { useCallback, useState } from 'react';

import { kioskService, type KioskStockReplaceLine } from '../kioskService';


export type UseKioskStockEditParams = {
	kioskId: string;
	onUpdateSuccess?: () => void;
};

export function useKioskStockEdit({ kioskId, onUpdateSuccess }: UseKioskStockEditParams) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = useCallback(
		async (stocks: KioskStockReplaceLine[]) => {
			if (!kioskId?.trim()) {
				notifications.show({
					title: 'Error',
					message: 'Missing kiosk id',
					color: 'red',
				});
				return;
			}
			setIsSubmitting(true);
			try {
				await kioskService.replaceKioskStocks(kioskId, { stocks });
				onUpdateSuccess?.();
				notifications.show({
					title: 'Success',
					message: 'Kiosk stock updated',
					color: 'green',
				});
			}
			catch (err) {
				const message = err instanceof Error ? err.message : 'Update kiosk stock failed';
				notifications.show({ title: 'Error', message, color: 'red' });
			}
			finally {
				setIsSubmitting(false);
			}
		},
		[kioskId, onUpdateSuccess],
	);

	return { handleSubmit, isSubmitting };
}
