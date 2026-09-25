import { TablePaginationProps } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import {
	VendingMachineDispatch,
	kioskMediaActions,
	selectKioskMediaList,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import { SearchGraph, SearchParams } from '@/types';

import type { KioskMedia } from '../types';


export function useKioskMediaList(
	{ graph, enabled = true }: { graph?: SearchGraph; enabled?: boolean } = {},
) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskMediaList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<KioskMedia> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(kioskMediaActions.listKioskMedias(params));
	}, [dispatch]);

	const paginationState = usePagination(fetchList, selectKioskMediaList, { graph });
	const { page, pageSize } = paginationState;

	React.useEffect(() => {
		if (!enabled) {
			dispatch(kioskMediaActions.resetKioskMediaList());
			return;
		}
		fetchList(page, pageSize, graph);
	}, [dispatch, enabled, fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		if (!enabled) return;
		fetchList(page, pageSize, graph);
	}, [enabled, fetchList, page, pageSize, graph]);

	const items = list.items ?? [];
	const status = list.status;
	const loading = status === 'pending';
	const error = status === 'error' ? list.error ?? null : null;
	const isLoadingList = enabled && !items.length && (status === 'pending' || status === 'idle');

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
		loading,
		error,
		handleRefresh,
		pagination,
	};
}
