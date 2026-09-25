/* eslint-disable max-lines-per-function */
import { type TablePaginationProps } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { TFunction } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
	VendingMachineDispatch,
	eventAvailableProductActions,
	selectEventAvailableProductList,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import { SearchGraph } from '@/types';

import { DEFAULT_EVENT_AVAILABLE_PAGE_SIZE } from '../eventAvailableProductSlice';


const PAGE_SIZES = [5, 10, 15] as const;

function usePageSizeOptions(translate: TFunction): TablePaginationProps['pageSizeOptions'] {
	return useMemo(
		() =>
			PAGE_SIZES.map((n) => ({
				value: String(n),
				label: translate('nikki.general.pagination.page_size', { count: n }),
			})),
		[translate],
	);
}

export function useAvailableProductForEvent(eventId: string | undefined, graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectEventAvailableProductList);
	const { t: translate } = useTranslation();
	const pageSizeOptions = usePageSizeOptions(translate);

	const fetchList = useCallback(
		(targetPage: number, size: number, searchGraph?: SearchGraph) => {
			if (!eventId) {
				return;
			}
			dispatch(
				eventAvailableProductActions.searchEventAvailableProducts({
					eventId,
					page: targetPage - 1,
					size,
					graph: searchGraph,
				}),
			);
		},
		[dispatch, eventId],
	);

	const resetKey = useMemo(
		() => `${eventId ?? ''}:${JSON.stringify(graph ?? {})}`,
		[eventId, graph],
	);

	const paginationCtrl = usePagination(fetchList, selectEventAvailableProductList, {
		graph,
		fallbackPageSize: DEFAULT_EVENT_AVAILABLE_PAGE_SIZE,
		resetPageKey: resetKey,
	});
	const { page, pageSize } = paginationCtrl;

	useEffect(() => {
		if (!eventId) {
			return;
		}
		fetchList(page, pageSize, graph);
	}, [eventId, page, pageSize, graph, fetchList]);

	const handleRefresh = useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const pagination = useMemo<TablePaginationProps>(
		() => ({
			totalItems: paginationCtrl.totalItems,
			page: paginationCtrl.page,
			totalPages: paginationCtrl.totalPages,
			onPageChange: paginationCtrl.onPageChange,
			pageSize: paginationCtrl.pageSize,
			pageSizeOptions,
			onPageSizeChange: paginationCtrl.onPageSizeChange,
		}),
		[paginationCtrl, pageSizeOptions],
	);

	const products = list.items ?? [];
	const status = list.status;
	const isLoading = Boolean(eventId) && (status === 'pending' || (status === 'idle' && !products.length));

	return {
		products,
		status,
		listError: list.error,
		isLoading,
		handleRefresh,
		pagination,
	};
}
