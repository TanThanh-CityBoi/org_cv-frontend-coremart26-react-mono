/* eslint-disable max-lines-per-function */
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { type TablePaginationProps } from '@nikkierp/ui/components';
import { TFunction } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
// The enum, not the `'asc' | 'desc'` type alias the `@/types` barrel re-exports under the same name.
import { SortDirection } from '../../../types/search-graph';
import {
	DEFAULT_EVENT_AVAILABLE_PAGE_SIZE,
	eventAvailableProductService,
} from '../eventAvailableProductStoreService';

import type { KioskProduct } from '../../kioskProducts/type';


const PAGE_SIZES = [5, 10, 15] as const;

type SearchResponse = { items: KioskProduct[], total: number };

function usePageSizeOptions(translate: TFunction): TablePaginationProps['pageSizeOptions'] {
	return useMemo(
		() =>
			PAGE_SIZES.map((n) => ({
				value: String(n),
				label: translate('datatable.pageSize', { count: n }),
			})),
		[translate],
	);
}

export function useAvailableProductForEvent(eventId: string | undefined, graph?: SearchGraph) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(eventAvailableProductService.search);
	const { t: translate } = useTranslation('vending_machine');
	const pageSizeOptions = usePageSizeOptions(translate);

	const fetchList = useCallback(
		(targetPage: number, size: number, searchGraph?: SearchGraph) => {
			if (!eventId) {
				return;
			}
			dispatchMethod({
				eventId,
				page: targetPage - 1,
				size,
				graph: { order: [['created_at', SortDirection.DESC]], ...(searchGraph ?? {}) },
			});
		},
		[dispatchMethod, eventId],
	);

	const resetKey = useMemo(
		() => `${eventId ?? ''}:${JSON.stringify(graph ?? {})}`,
		[eventId, graph],
	);

	const paginationCtrl = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
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

	const products = result.data?.items ?? [];
	const status = result.isPending ? 'pending' : 'success';
	const isLoading = Boolean(eventId) && (result.isPending || (result.doneAt == null && !products.length));

	return {
		products,
		status,
		listError: result.error,
		isLoading,
		handleRefresh,
		pagination,
	};
}
