import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	kioskSettingActions,
	selectKioskSettingList,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import { KIOSK_SETTING_DEFAULT_PAGE_SIZE } from '@/features/kioskSettings/kioskSettingSlice';
import { SearchGraph, SearchParams } from '@/types';


import { KioskSetting } from '../types';


export function useKioskSettingList(options?: { enabled?: boolean; graph?: SearchGraph }) {
	const enabled = options?.enabled ?? true;
	const graph = options?.graph;

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskSettingList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<KioskSetting> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(kioskSettingActions.searchKioskSettings(params));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectKioskSettingList, {
		graph,
		fallbackPageSize: KIOSK_SETTING_DEFAULT_PAGE_SIZE,
	});
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [enabled, fetchList, graph, page, pageSize]);

	const handleRefresh = React.useCallback(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [enabled, fetchList, graph, page, pageSize]);

	const settings = list.items;
	const status = list.status;
	const isLoading = enabled && !settings?.length && (status === 'pending' || status === 'idle');

	return {
		settings,
		status,
		isLoadingList: isLoading,
		handleRefresh,
		pagination,
	};
}
