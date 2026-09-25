/* eslint-disable max-lines-per-function */
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { type TablePaginationProps } from '@nikkierp/ui/components';
import { TFunction } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { kioskAvailableProductStoreService } from '../kioskAvailableProductStoreService';

import type { KioskProduct } from '../type';


export const DEFAULT_AVAILABLE_PAGE_SIZE = 5;

type SearchResponse = { items: KioskProduct[], total: number };


const KIOSK_PRODUCT_PAGE_SIZES = [5, 10, 15] as const;

function usePageSizeOptions(translate: TFunction): TablePaginationProps['pageSizeOptions'] {
	return useMemo(
		() =>
			KIOSK_PRODUCT_PAGE_SIZES.map((n) => ({
				value: String(n),
				label: translate('datatable.pageSize', { count: n }),
			})),
		[translate],
	);
}

export function useAvailableProductForKiosk(kioskId: string | undefined, graph?: SearchGraph) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(
		kioskAvailableProductStoreService.search,
	);
	const { t: translate } = useTranslation('vending_machine');
	const pageSizeOptions = usePageSizeOptions(translate);

	const fetchList = useCallback(
		(targetPage: number, size: number, searchGraph?: SearchGraph) => {
			if (!kioskId) {
				return;
			}
			dispatchMethod({ kioskId, page: targetPage - 1, size, graph: searchGraph });
		},
		[dispatchMethod, kioskId],
	);

	const resetKey = useMemo(
		() => `${kioskId ?? ''}:${JSON.stringify(graph ?? {})}`,
		[kioskId, graph],
	);

	const paginationCtrl = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
		graph,
		fallbackPageSize: DEFAULT_AVAILABLE_PAGE_SIZE,
		resetPageKey: resetKey,
	});
	const { page, pageSize } = paginationCtrl;

	useEffect(() => {
		if (!kioskId) {
			return;
		}
		fetchList(page, pageSize, graph);
	}, [kioskId, page, pageSize, graph, fetchList]);

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
	const isLoading = Boolean(kioskId)
		&& (result.isPending || (result.doneAt == null && !products.length));

	return {
		products,
		status,
		listError: result.error,
		isLoading,
		handleRefresh,
		pagination,
	};
}
