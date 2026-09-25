import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { settingStoreService } from '../settingStoreService';
import { Setting } from '../types';


type SearchResponse = { items: Setting[], total: number };

export function useSettingList({ graph }: { graph?: SearchGraph } = {}) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(settingStoreService.search);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatchMethod({ page: targetPage - 1, size, graph: searchGraph });
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const settings = result.data?.items ?? [];
	const status = result.isPending ? 'pending' : 'success';
	const isLoading = !settings.length && (result.isPending || result.doneAt == null);
	const isEmpty = !settings.length && !result.isPending && result.doneAt != null;

	return {
		settings,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}
