import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect } from 'react';

import { VendingMachineDispatch, eventActions, selectEventStocks } from '@/appState';

import type { EventStock } from '@/features/events/types';


const EMPTY: EventStock[] = [];

export function useEventStock(eventId: string | undefined, apiPage?: number, apiSize?: number) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const eventStocks = useMicroAppSelector(selectEventStocks);

	const page = apiPage ?? 0;
	const size = apiSize ?? 10;

	useEffect(() => {
		if (eventId) {
			dispatch(eventActions.fetchEventStocks({ eventId, page, size }));
		}
	}, [eventId, dispatch, page, size]);

	const refetch = useCallback(
		(overrideEventId?: string) => {
			const id = overrideEventId ?? eventId;
			if (!id) {
				return Promise.reject(new Error('Missing event id'));
			}
			return dispatch(eventActions.fetchEventStocks({ eventId: id, page, size }));
		},
		[dispatch, eventId, page, size],
	);

	return {
		stocks: eventStocks.items ?? EMPTY,
		pagination: { total: eventStocks.total, page: eventStocks.page, size: eventStocks.size },
		status: eventStocks.status,
		error: eventStocks.error,
		isLoading: eventStocks.status === 'pending' || eventStocks.status === 'idle',
		refetch,
	};
}
