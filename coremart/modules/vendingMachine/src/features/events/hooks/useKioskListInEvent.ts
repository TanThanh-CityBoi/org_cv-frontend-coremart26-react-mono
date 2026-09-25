import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	eventActions,
	selectKioskListInEvent,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import { Kiosk } from '@/features/kiosks/types';
import { SearchGraph, SearchParams } from '@/types';


export function useKioskListInEvent(
	{ eventId, graph }: { eventId: string; graph?: SearchGraph },
) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskListInEvent);

	const fetchList = React.useCallback(
		(targetPage: number, pageSize: number, searchGraph?: SearchGraph) => {
			const params: SearchParams<Kiosk> & { eventId: string } = {
				eventId,
				page: targetPage - 1,
				size: pageSize,
				graph: searchGraph,
			};
			dispatch(eventActions.listKiosksInEvent(params));
		},
		[dispatch, eventId],
	);

	const pagination = usePagination(fetchList, selectKioskListInEvent, {
		graph,
		resetPageKey: eventId,
	});
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const kiosks = list.items;
	const status = list.status;
	const isLoading = !kiosks?.length && (status === 'pending' || status === 'idle');
	const isEmpty = !kiosks?.length && status !== 'idle' && status !== 'pending';

	return {
		kiosks,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}
