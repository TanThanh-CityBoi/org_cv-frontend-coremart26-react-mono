import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, settingActions, selectSettingList } from '@/appState';
import { usePagination } from '@/common/hooks';
import { SearchGraph, SearchParams } from '@/types';

import { Setting } from '../types';


export function useSettingList({ graph }: { graph?: SearchGraph } = {}) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectSettingList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<Setting> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(settingActions.listSettings(params));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectSettingList, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const settings = list.items ?? [];
	const status = list.status;
	const isLoading = !settings.length && (status === 'pending' || status === 'idle');
	const isEmpty = !settings.length && status !== 'idle' && status !== 'pending';

	return {
		settings,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}
