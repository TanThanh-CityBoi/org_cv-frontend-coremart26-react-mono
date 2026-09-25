import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useEffect } from 'react';

import { eventStockCrudService } from '../eventStockService';

import type { EventStock } from '../types';


const EMPTY: EventStock[] = [];

type SearchResponse = { items: EventStock[], total: number, page: number, size: number };

export function useEventStock(eventId: string | undefined, apiPage?: number, apiSize?: number) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(eventStockCrudService.search);

	const page = apiPage ?? 0;
	const size = apiSize ?? 10;

	// The backend serves this resource flat, so the event is a filter rather than a path segment.
	const fetchList = useCallback(
		(targetEventId: string) => dispatchMethod({
			page,
			size,
			graph: { if: ['event_ref', 'eq', targetEventId] },
		}),
		[dispatchMethod, page, size],
	);

	useEffect(() => {
		if (eventId) {
			fetchList(eventId);
		}
	}, [eventId, fetchList]);

	const refetch = useCallback(
		(overrideEventId?: string) => {
			const id = overrideEventId ?? eventId;
			if (!id) {
				return Promise.reject(new Error('Missing event id'));
			}
			return fetchList(id);
		},
		[fetchList, eventId],
	);

	return {
		stocks: result.data?.items ?? EMPTY,
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
