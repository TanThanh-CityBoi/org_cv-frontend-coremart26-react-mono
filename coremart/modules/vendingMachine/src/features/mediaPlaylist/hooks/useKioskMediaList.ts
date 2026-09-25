import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { TablePaginationProps } from '@nikkierp/ui/components';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { kioskMediaCrudService } from '../kioskMediaCrudService';

import type { KioskMedia } from '../types';


type SearchResponse = { items: KioskMedia[], total: number };


export function useKioskMediaList(
	{ graph, enabled = true }: { graph?: SearchGraph, enabled?: boolean } = {},
) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(kioskMediaCrudService.search);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatchMethod({ page: targetPage - 1, size, graph: searchGraph });
	}, [dispatchMethod]);

	const paginationState = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
	const { page, pageSize } = paginationState;

	React.useEffect(() => {
		// No reset-on-disable: the slice action that cleared the list is gone, and a disabled
		// list simply stops fetching. Stale items are not rendered because callers gate on `enabled`.
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [enabled, fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [enabled, fetchList, page, pageSize, graph]);

	const items = result.data?.items ?? [];
	const isLoadingList = enabled && !items.length && result.isPending;

	const pagination: TablePaginationProps = {
		totalItems: paginationState.totalItems,
		page: paginationState.page,
		totalPages: paginationState.totalPages,
		onPageChange: paginationState.onPageChange,
		pageSize: paginationState.pageSize,
		onPageSizeChange: paginationState.onPageSizeChange,
	};

	return {
		items,
		isLoadingList,
		loading: result.isPending,
		error: result.error ?? null,
		handleRefresh,
		pagination,
	};
}
