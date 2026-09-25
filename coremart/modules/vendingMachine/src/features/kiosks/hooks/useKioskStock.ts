import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useEffect } from 'react';

import { kioskStockService } from '../kioskStockService';

import type { KioskStock } from '../components/KioskDetail/KioskStockGrid/kioskStock.types';


const EMPTY_KIOSK_STOCKS: KioskStock[] = [];

type SearchResponse = { items: KioskStock[], total: number, page: number, size: number };

export function useKioskStock(kioskId: string | undefined, apiPage?: number, apiSize?: number) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(kioskStockService.search);

	const page = apiPage ?? 0;
	const size = apiSize ?? 100;

	// Nested resource: the kiosk id is the trailing `primaryResourceId`, so the params must be
	// the `[request, kioskId]` array form — a bare object would leave it undefined and throw.
	const fetchList = useCallback(
		(targetKioskId: string) => dispatchMethod([{ page, size }, targetKioskId]),
		[dispatchMethod, page, size],
	);

	useEffect(() => {
		if (kioskId) {
			fetchList(kioskId);
		}
	}, [kioskId, fetchList]);

	const refetch = useCallback(
		(overrideKioskId?: string) => {
			const id = overrideKioskId ?? kioskId;
			if (!id) {
				return Promise.reject(new Error('Missing kiosk id'));
			}
			return fetchList(id);
		},
		[fetchList, kioskId],
	);

	return {
		stocks: result.data?.items ?? EMPTY_KIOSK_STOCKS,
		pagination: {
			total: result.data?.total ?? 0,
			page: result.data?.page ?? page,
			size: result.data?.size ?? size,
		},
		status: result.isPending ? 'pending' : 'success',
		error: result.error,
		isLoading: result.isPending || result.doneAt == null,
		refetch,
	};
}
