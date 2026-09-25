import { TablePaginationProps } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	mediaPlaylistActions,
	selectMediaPlaylistList,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import { SearchGraph, SearchParams } from '@/types';

import type { Playlist } from '../types';


export function useMediaPlaylistList(
	{ graph, enabled = true }: { graph?: SearchGraph; enabled?: boolean } = {},
) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectMediaPlaylistList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<Playlist> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(mediaPlaylistActions.listMediaPlaylists(params));
	}, [dispatch]);

	const paginationState = usePagination(fetchList, selectMediaPlaylistList, { graph });
	const { page, pageSize } = paginationState;

	React.useEffect(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph, enabled]);

	const handleRefresh = React.useCallback(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph, enabled]);

	const playlists = list.items;
	const status = list.status;
	const isLoadingList =
		enabled && !playlists?.length && (status === 'pending' || status === 'idle');
	const listError = status === 'error' ? list.error : null;

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
		listError,
	};
}
