import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { eventCrudService } from '../eventService';

import type { Event } from '../types';


type GetOneResponse = { item: Event };


export function useEventDetail(eventId?: string) {
	const { dispatchMethod, result } = useServiceLayer<GetOneResponse>(eventCrudService.getById);

	React.useEffect(() => {
		if (eventId) {
			dispatchMethod({ id: eventId });
		}
	}, [eventId, dispatchMethod]);

	return {
		event: result.data?.item,
		isLoading: result.isPending,
	};
}
