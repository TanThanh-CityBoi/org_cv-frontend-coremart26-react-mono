import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	eventActions,
	selectEventList,
} from '@/appState';
import { usePagination } from '@/common/hooks';

import type { Event } from '../types';
import type { SearchGraph, SearchParams } from '@/types';


export function useEventList({ graph }: { graph?: SearchGraph } = {}) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectEventList);

	const fetchList = React.useCallback((targetPage: number, pageSizeArg: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<Event> = {
			page: targetPage - 1,
			size: pageSizeArg,
			graph: searchGraph,
		};
		dispatch(eventActions.listEvents(params));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectEventList, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const events = list.items;
	const status = list.status;
	const isLoading = !events?.length && (status === 'pending' || status === 'idle');
	const isEmpty = !events?.length && status !== 'idle' && status !== 'pending';

	return {
		events,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}
