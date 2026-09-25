import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	kioskSettingActions,
	selectKioskListInSetting,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import { Kiosk } from '@/features/kiosks/types';
import { SearchGraph, SearchParams } from '@/types';


export function useKioskListInSetting({ graph }: { graph?: SearchGraph } = {}) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskListInSetting);

	const fetchList = React.useCallback((targetPage: number, pageSize: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<Kiosk> = {
			page: targetPage - 1,
			size: pageSize,
			graph: searchGraph,
		};
		dispatch(kioskSettingActions.listKiosksInSetting(params));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectKioskListInSetting, { graph });
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
