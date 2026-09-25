import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect } from 'react';

import { VendingMachineDispatch, kioskActions, selectKioskStock } from '@/appState';

import type { KioskStock } from '../components/KioskDetail/KioskStockGrid/kioskStock.types';


const EMPTY_KIOSK_STOCKS: KioskStock[] = [];

export function useKioskStock(kioskId: string | undefined, apiPage?: number, apiSize?: number) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const kioskStock = useMicroAppSelector(selectKioskStock);

	const page = apiPage ?? 0;
	const size = apiSize ?? 100;

	useEffect(() => {
		if (kioskId) {
			dispatch(kioskActions.fetchKioskStocks({ kioskId, page, size }));
		}
	}, [kioskId, dispatch, page, size]);

	const refetch = useCallback(
		(overrideKioskId?: string) => {
			const id = overrideKioskId ?? kioskId;
			if (!id) {
				return Promise.reject(new Error('Missing kiosk id'));
			}
			return dispatch(kioskActions.fetchKioskStocks({ kioskId: id, page, size }));
		},
		[dispatch, kioskId, page, size],
	);

	return {
		stocks: kioskStock.items ?? EMPTY_KIOSK_STOCKS,
		pagination: { total: kioskStock.total, page: kioskStock.page, size: kioskStock.size },
		status: kioskStock.status,
		error: kioskStock.error,
		isLoading: kioskStock.status === 'pending' || kioskStock.status === 'idle',
		refetch,
	};
}
