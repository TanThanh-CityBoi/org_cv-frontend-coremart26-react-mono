import { notifications } from '@mantine/notifications';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { triggerBlobDownload } from '../../../../common/helpers';
import { usePaginationWithTotal } from '../../../../common/hooks';
import {
	INVENTORY_REPORT_DEFAULT_PAGE_SIZE,
	inventoryReportService,
} from '../inventoryReportService';

import type { InventoryReportAppliedFilters, ProductInventoryReport } from '../components/InventoryReport/type';


const CHART_PAGE_SIZE = 50;

type SearchResponse = { items: ProductInventoryReport[], total: number };

export function useInventoryProducts(applied: InventoryReportAppliedFilters) {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(
		inventoryReportService.getProducts,
	);

	const fetchList = useCallback((page: number, size: number) => {
		dispatchMethod({ kioskIds: applied.kioskIds ?? [], page: page - 1, size });
	}, [dispatchMethod, applied.kioskIds]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
		fallbackPageSize: INVENTORY_REPORT_DEFAULT_PAGE_SIZE,
		resetPageKey: `${applied.kioskIds?.join(',') ?? ''}`,
	});
	const { page, pageSize } = pagination;

	useEffect(() => {
		fetchList(page, pageSize);
	}, [fetchList, page, pageSize]);

	// `exportProducts` is not a `@storeAsyncMethod`: a Blob is not state, so it is called directly.
	const handleExport = useCallback(async () => {
		try {
			const blob = await inventoryReportService.exportProducts({
				kioskIds: applied.kioskIds ?? [],
				page: 0,
				size: 10_000,
			});
			triggerBlobDownload(blob, `Inventory-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_success'),
			});
		}
		catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			notifications.show({
				color: 'red',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_failed', { message }),
			});
		}
	}, [applied.kioskIds, translate]);

	return {
		items: result.data?.items,
		isLoading: (result.isPending || result.doneAt == null) && !result.data?.items?.length,
		error: result.error,
		pagination,
		handleExport,
	};
}


export function useInventoryChartProducts(applied: InventoryReportAppliedFilters) {
	// `getChartProducts`, not `getProducts` — service-layer state is keyed by method name, so
	// sharing the method would make the chart and the table clobber each other's results.
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(
		inventoryReportService.getChartProducts,
	);

	const kioskIds = useMemo(() => applied.kioskIds, [applied.kioskIds]);

	useEffect(() => {
		dispatchMethod({ kioskIds: kioskIds ?? [], page: 0, size: CHART_PAGE_SIZE });
	}, [dispatchMethod, kioskIds]);

	return {
		items: result.data?.items,
		isLoading: result.isPending || result.doneAt == null,
		error: result.error,
	};
}
