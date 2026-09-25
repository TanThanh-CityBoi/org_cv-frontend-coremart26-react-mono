import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	kioskActions,
	selectKioskList,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import { SearchGraph, SearchParams } from '@/types';

import { Kiosk } from '../types';


export function useKioskList({ graph }: { graph?: SearchGraph } = {}) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<Kiosk> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(kioskActions.listKiosks(params));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectKioskList, { graph });
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
