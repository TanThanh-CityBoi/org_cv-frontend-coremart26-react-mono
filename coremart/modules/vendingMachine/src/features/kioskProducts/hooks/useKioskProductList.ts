/* eslint-disable max-lines-per-function */
import { type TablePaginationProps } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { TFunction } from 'i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	VendingMachineDispatch,
	kioskProductActions,
	selectKioskProductList,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import {
	controlPanelToSearchGraph,
	type ControlPanelFilterConfig,
} from '@/components';
import { SearchGraph, SearchNode } from '@/types';

import { DEFAULT_PAGE_SIZE } from '../kioskProductSlice';


const KIOSK_PRODUCT_PAGE_SIZES = [5, 10, 15] as const;

function usePageSizeOptions(translate: TFunction): TablePaginationProps['pageSizeOptions'] {
	return useMemo(
		() =>
			KIOSK_PRODUCT_PAGE_SIZES.map((n) => ({
				value: String(n),
				label: translate('nikki.general.pagination.page_size', { count: n }),
			})),
		[translate],
	);
}

export function useKioskProductList(orgId: string | undefined, graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskProductList);
	const { t: translate } = useTranslation();
	const pageSizeOptions = usePageSizeOptions(translate);

	const fetchList = useCallback(
		(targetPage: number, size: number, searchGraph?: SearchGraph) => {
			if (!orgId) {
				return;
			}
			dispatch(
				kioskProductActions.searchKioskProducts({
					orgId,
					page: targetPage - 1,
					size,
					graph: searchGraph,
				}),
			);
		},
		[dispatch, orgId],
	);

	const resetKey = useMemo(
		() => `${orgId ?? ''}:${JSON.stringify(graph ?? {})}`,
		[orgId, graph],
	);

	const paginationCtrl = usePagination(fetchList, selectKioskProductList, {
		graph,
		fallbackPageSize: DEFAULT_PAGE_SIZE,
		resetPageKey: resetKey,
	});
	const { page, pageSize } = paginationCtrl;

	useEffect(() => {
		if (!orgId) {
			return;
		}
		fetchList(page, pageSize, graph);
	}, [orgId, page, pageSize, graph, fetchList]);

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
	const isLoading = Boolean(orgId) && (status === 'pending' || (status === 'idle' && !products.length));

	return {
		products,
		status,
		listError: list.error,
		isLoading,
		handleRefresh,
		pagination,
	};
}

export function useKioskProductFilter(preGraph?: SearchNode) {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');

	const filters: ControlPanelFilterConfig[] = useMemo(
		() => [
			{
				key: 'search',
				searchFields: ['sku', 'barcode', 'name'],
				type: 'search' as const,
				value: searchValue,
				onChange: setSearchValue,
				placeholder: translate('coremart.vendingMachine.kioskProducts.search.placeholder'),
			},
		],
		[searchValue, translate],
	);

	const graph = useMemo(() => {
		const innerGraph = controlPanelToSearchGraph(filters);
		return {
			and: [
				innerGraph,
				preGraph ?? {},
			],
		};
	}, [filters]);

	return { filters, graph };
}
