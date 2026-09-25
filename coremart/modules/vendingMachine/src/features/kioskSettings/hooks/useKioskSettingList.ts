import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { KIOSK_SETTING_DEFAULT_PAGE_SIZE, kioskSettingCrudService } from '../kioskSettingService';
import { KioskSetting } from '../types';


type SearchResponse = { items: KioskSetting[], total: number };


export function useKioskSettingList(options?: { enabled?: boolean, graph?: SearchGraph }) {
	const enabled = options?.enabled ?? true;
	const graph = options?.graph;

	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(kioskSettingCrudService.search);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatchMethod({ page: targetPage - 1, size, graph: searchGraph });
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
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

	const settings = result.data?.items;
	const isLoading = enabled && !settings?.length && result.isPending;

	return {
		settings,
		status: result.isPending ? 'pending' : 'success',
		isLoadingList: isLoading,
		handleRefresh,
		pagination,
	};
}
