/* eslint-disable max-lines-per-function */
import { notifications } from '@mantine/notifications';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { triggerBlobDownload } from '../../../../common/helpers';
import { usePaginationWithTotal, UsePaginationOptions } from '../../../../common/hooks';
import {
	appliedFiltersStableKey,
	revenueFiltersToBaseQuery,
	revenueReportByOrderTimeQuery,
	revenueReportListQuery,
	timeRangeToGroupTime,
} from '../../helpers';
import { RevenueReportFilters } from '../components';
import { revenueReportService, REVENUE_REPORT_DEFAULT_PAGE_SIZE } from '../revenueReportService';

import type {
	ReportOverview,
	RevenueOverview,
	RevenueReportByCategory,
	RevenueReportByHour,
	RevenueReportByKiosk,
	RevenueReportByOrderTime,
	RevenueReportByPaymentMethod,
	RevenueReportByProduct,
} from '../type';
import type { ServiceLayerResult } from '@nikkierp/ui/appState/store';



/** What a paged revenue endpoint returns. */
type RevenuePage<R> = { items: R[], total: number, overview?: ReportOverview<R> | null };


/** Khóa ổn định khi filter thay đổi — `usePagination` reset về trang 1. */
export function revenueReportFiltersKey(filters: RevenueReportFilters): string {
	return appliedFiltersStableKey(filters);
}

function useRevenueReportList<R>(
	result: ServiceLayerResult<RevenuePage<R>>,
	fetchList: (targetPage: number, pageSize: number) => void,
	paginationOptions?: UsePaginationOptions,
) {
	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
		fallbackPageSize: REVENUE_REPORT_DEFAULT_PAGE_SIZE,
		...paginationOptions,
	});
	const { page, pageSize } = pagination;

	useEffect(() => {
		fetchList(page, pageSize);
	}, [fetchList, page, pageSize]);

	const handleRefresh = useCallback(() => {
		fetchList(page, pageSize);
	}, [fetchList, page, pageSize]);

	const items: R[] = result.data?.items ?? [];
	const overview: ReportOverview<R> | null = result.data?.overview ?? null;
	const isLoading = !items.length && (result.isPending || result.doneAt == null);
	const isEmpty = !items.length && !result.isPending && result.doneAt != null;

	return {
		overview,
		items,
		pagination,
		status: result.isPending ? 'pending' : 'success',
		error: result.error,
		isLoading,
		isEmpty,
		//* Actions
		handleRefresh,
	};
}


export function useRevenueReportByHour(filters: RevenueReportFilters) {
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByHour>>(
		revenueReportService.getByHour,
	);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({ filters, pageQuery: { page: targetPage ?? 1, size: pageSize ?? 10 } });
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	return useRevenueReportList<RevenueReportByHour>(
		result,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);
}

/**
 * Overview — không phân trang. `timeOfDateFrom` / `timeOfDateTo` phải dạng `hh:mm:ss` trên URL.
 * Nên bọc `query` trong `useMemo` ở nơi gọi để đỡ fetch lặp không cần thiết.
 */
export function useRevenueReportOverview( filters: RevenueReportFilters ) {
	const { dispatchMethod, result } = useServiceLayer<RevenueOverview>(revenueReportService.getOverview);
	const query = useMemo(() => revenueFiltersToBaseQuery(filters), [filters]);

	const refresh = useCallback(() => {
		if (!query) return;
		dispatchMethod(query);
	}, [dispatchMethod, query]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const status = result.isPending ? 'pending' : 'success';
	const data = result.data ?? undefined;
	const error = result.error;
	const isLoading = (result.isPending || result.doneAt == null) && !data;

	return {
		data,
		status,
		error,
		isLoading,
		refresh,
	};
}

export function useRevenueReportByOrderTime(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByOrderTime>>(
		revenueReportService.getByOrderTime,
	);
	const groupTime = useMemo(() => timeRangeToGroupTime(filters.dateRange), [filters.dateRange]);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportByOrderTimeQuery({
			filters,
			groupTime,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { orderTime: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 500 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.missing_date_range'),
			});
			return;
		}
		try {
			const blob = await revenueReportService.exportByOrderTime({
				...query,
				groupTime: 'day',
			});
			triggerBlobDownload(blob, `Revenue-by-order-time-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_success'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_failed', { message }),
			});
		}
	}, [filters, translate]);

	const resetPageKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const list = useRevenueReportList<RevenueReportByOrderTime>(
		result,
		fetchList,
		{ resetPageKey },
	);

	return { ...list, handleExport, groupTime };
}


export function useRevenueTimeSeriesChart(filters: RevenueReportFilters) {
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByOrderTime>>(
		revenueReportService.getTimeSeriesChart,
	);
	const groupTime = useMemo(() => timeRangeToGroupTime(filters.dateRange), [filters.dateRange]);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportByOrderTimeQuery({
			filters,
			groupTime,
			pageQuery: { page: targetPage, size: pageSize },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	const resetPageKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const list = useRevenueReportList<RevenueReportByOrderTime>(
		result,
		fetchList,
		{ resetPageKey, fallbackPageSize: 60 },
	);

	return { ...list, groupTime };
}


export function useRevenueReportByKiosk(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByKiosk>>(
		revenueReportService.getByKiosk,
	);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 1000 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.missing_date_range'),
			});
			return;
		}
		try {
			const blob = await revenueReportService.exportByKiosk({ ...query });
			triggerBlobDownload(blob, `Revenue-by-kiosk-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_success'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_failed', { message }),
			});
		}
	}, [filters, translate]);

	const list = useRevenueReportList<RevenueReportByKiosk>(
		result,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);

	return { ...list, handleExport };
}

export function useRevenueReportByKioskChart(filters: RevenueReportFilters) {
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByKiosk>>(
		revenueReportService.getByKioskChart,
	);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 10 },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByKiosk[] = result.data?.items ?? [];
	const status = result.isPending ? 'pending' : 'success';
	const isLoading = !items.length && (result.isPending || result.doneAt == null);

	return { items, isLoading, error: result.error, status };
}


export function useRevenueReportByProduct(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByProduct>>(
		revenueReportService.getByProduct,
	);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 1000 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.missing_date_range'),
			});
			return;
		}
		try {
			const blob = await revenueReportService.exportByProduct({ ...query });
			triggerBlobDownload(blob, `Revenue-by-product-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_success'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_failed', { message }),
			});
		}
	}, [filters, translate]);

	const list = useRevenueReportList<RevenueReportByProduct>(
		result,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);

	return { ...list, handleExport };
}

export function useRevenueReportByProductChart(filters: RevenueReportFilters) {
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByProduct>>(
		revenueReportService.getByProductChart,
	);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 10 },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByProduct[] = result.data?.items ?? [];
	const status = result.isPending ? 'pending' : 'success';
	const isLoading = !items.length && (result.isPending || result.doneAt == null);

	return { items, isLoading, error: result.error, status };
}

export function useRevenueReportByCategoryChart(filters: RevenueReportFilters) {
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByCategory>>(
		revenueReportService.getByCategoryChart,
	);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 10 },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByCategory[] = result.data?.items ?? [];
	const status = result.isPending ? 'pending' : 'success';
	const isLoading = !items.length && (result.isPending || result.doneAt == null);

	return { items, isLoading, error: result.error, status, overview: result.data?.overview ?? null };
}


export function useRevenueReportByCategory(filters: RevenueReportFilters) {
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByCategory>>(
		revenueReportService.getByCategory,
	);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({ filters, pageQuery: { page: targetPage, size: pageSize } });
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	return useRevenueReportList<RevenueReportByCategory>(
		result,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);
}

export function useRevenueReportByPaymentMethodChart(filters: RevenueReportFilters) {
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByPaymentMethod>>(
		revenueReportService.getByPaymentMethodChart,
	);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 100 }, //* get full list
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByPaymentMethod[] = result.data?.items ?? [];
	const status = result.isPending ? 'pending' : 'success';
	const isLoading = !items.length && (result.isPending || result.doneAt == null);

	return { items, isLoading, error: result.error, status };
}


export function useRevenueReportByPaymentMethod(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer<RevenuePage<RevenueReportByPaymentMethod>>(
		revenueReportService.getByPaymentMethod,
	);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatchMethod(q);
	}, [dispatchMethod, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 50 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.missing_date_range'),
			});
			return;
		}
		try {
			const blob = await revenueReportService.exportByPaymentMethod({ ...query });
			triggerBlobDownload(blob, `Revenue-by-payment-method-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_success'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('reports.revenue_report.export'),
				message: translate('reports.revenue_report.export_failed', { message }),
			});
		}
	}, [filters, translate]);

	const list = useRevenueReportList<RevenueReportByPaymentMethod>(
		result,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);

	return { ...list, handleExport };
}
