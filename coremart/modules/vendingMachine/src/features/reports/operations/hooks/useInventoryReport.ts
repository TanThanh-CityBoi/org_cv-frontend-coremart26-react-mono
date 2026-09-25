
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
	inventoryReportActions,
	selectInventoryChartProducts,
	selectInventoryProducts,
	type VendingMachineDispatch,
} from '@/appState';
import { triggerBlobDownload } from '@/common/helpers';
import { usePagination } from '@/common/hooks';

import {
	inventoryReportService,
	INVENTORY_REPORT_DEFAULT_PAGE_SIZE,
} from '../inventoryReportService';

import type { InventoryReportAppliedFilters } from '../components/InventoryReport/type';


const CHART_PAGE_SIZE = 50;

export function useInventoryProducts(applied: InventoryReportAppliedFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const { t: translate } = useTranslation();
	const slice = useMicroAppSelector(selectInventoryProducts);

	const fetchList = useCallback(async (page: number, size: number) => {
		return dispatch(inventoryReportActions.fetchInventoryProducts({
			kioskIds: applied.kioskIds ?? [],
			page: page - 1,
			size,
		}));
	}, [dispatch, applied.kioskIds]);

	const pagination = usePagination(fetchList, selectInventoryProducts, {
		fallbackPageSize: INVENTORY_REPORT_DEFAULT_PAGE_SIZE,
		resetPageKey: `${applied.kioskIds?.join(',') ?? ''}`,
	});

	useEffect(() => {
		fetchList(pagination.page, pagination.pageSize);
	}, [fetchList]);

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
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportSuccess'),
			});
		}
		catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			notifications.show({
				color: 'red',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportFailed', { message }),
			});
		}
	}, [applied.kioskIds, translate]);

	return {
		items: slice.items,
		isLoading: (slice.status === 'pending' || slice.status === 'idle') && !slice?.items?.length,
		error: slice.error,
		pagination,
		handleExport,
	};
}


export function useInventoryChartProducts(applied: InventoryReportAppliedFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectInventoryChartProducts);

	const kioskIds = useMemo(() => applied.kioskIds, [applied.kioskIds]);

	useEffect(() => {
		dispatch(inventoryReportActions.fetchInventoryChartProducts({
			kioskIds: kioskIds ?? [],
			page: 0,
			size: CHART_PAGE_SIZE,
		}));
	}, [dispatch, kioskIds]);

	return {
		items: slice.items,
		isLoading: slice.status === 'pending' || slice.status === 'idle',
		error: slice.error,
	};
}
