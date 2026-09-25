import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { TablePaginationProps } from '@nikkierp/ui/components';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { mediaPlaylistCrudService } from '../mediaPlaylistCrudService';

import type { Playlist } from '../types';


type SearchResponse = { items: Playlist[], total: number };


export function useMediaPlaylistList(
	{ graph, enabled = true }: { graph?: SearchGraph, enabled?: boolean } = {},
) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(mediaPlaylistCrudService.search);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatchMethod({ page: targetPage - 1, size, graph: searchGraph });
	}, [dispatchMethod]);

	const paginationState = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
	const { page, pageSize } = paginationState;

	React.useEffect(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph, enabled]);

	const handleRefresh = React.useCallback(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph, enabled]);

	const playlists = result.data?.items;
	const isLoadingList = enabled && !playlists?.length && result.isPending;

	const pagination: TablePaginationProps = {
		totalItems: paginationState.totalItems,
		page: paginationState.page,
		totalPages: paginationState.totalPages,
		onPageChange: paginationState.onPageChange,
		pageSize: paginationState.pageSize,
		onPageSizeChange: paginationState.onPageSizeChange,
	};

	return {
		playlists,
		isLoadingList,
		handleRefresh,
		pagination,
		listError: result.error ?? null,
	};
}
