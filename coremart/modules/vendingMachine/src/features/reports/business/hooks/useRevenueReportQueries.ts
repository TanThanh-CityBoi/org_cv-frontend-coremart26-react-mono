/* eslint-disable max-lines-per-function */
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
	type VendingMachineDispatch,
	reducer,
	revenueReportActions,
	selectRevenueByCategory,
	selectRevenueByCategoryChart,
	selectRevenueByHour,
	selectRevenueByKiosk,
	selectRevenueByKioskChart,
	selectRevenueByOrderTime,
	selectRevenueByPaymentMethod,
	selectRevenueByPaymentMethodChart,
	selectRevenueByProduct,
	selectRevenueByProductChart,
	selectRevenueOverview,
	selectRevenueTimeSeriesChart,
} from '@/appState';
import { triggerBlobDownload } from '@/common/helpers';
import { type ListPaginationSelector, usePagination, UsePaginationOptions } from '@/common/hooks';
import {
	appliedFiltersStableKey,
	revenueFiltersToBaseQuery,
	revenueReportByOrderTimeQuery,
	revenueReportListQuery,
	timeRangeToGroupTime,
} from '@/features/reports/helpers';

import { RevenueReportFilters } from '../components';
import { revenueReportService, REVENUE_REPORT_DEFAULT_PAGE_SIZE } from '../revenueReportService';

import type { PagedReportState } from '../revenueReportSlice';
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
import type { ReduxActionState } from '@nikkierp/ui/appState';


type VmState = ReturnType<typeof reducer>;


/** Khóa ổn định khi filter thay đổi — `usePagination` reset về trang 1. */
export function revenueReportFiltersKey(filters: RevenueReportFilters): string {
	return appliedFiltersStableKey(filters);
}

function useRevenueReportList<R>(
	slice: PagedReportState<R>,
	selector: ListPaginationSelector<VmState>,
	fetchList: (targetPage: number, pageSize: number) => void,
	paginationOptions?: UsePaginationOptions,
) {
	const pagination = usePagination(fetchList, selector, {
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

	const items: R[] = slice.items ?? [];
	const overview: ReportOverview<R> | null = slice.overview ?? null;
	const status = slice.status;
	const isLoading = !items.length && (status === 'pending' || status === 'idle');
	const isEmpty = !items.length && status !== 'idle' && status !== 'pending';

	return {
		overview,
		items,
		pagination,
		//* Redux state
		status,
		error: slice.error,
		isLoading,
		isEmpty,
		//* Actions
		handleRefresh,
	};
}


export function useRevenueReportByHour(filters: RevenueReportFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByHour);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({ filters, pageQuery: { page: targetPage ?? 1, size: pageSize ?? 10 } });
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByHour(q));
	}, [dispatch, filters]);

	return useRevenueReportList<RevenueReportByHour>(
		slice,
		selectRevenueByHour,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);
}

/**
 * Overview — không phân trang. `timeOfDateFrom` / `timeOfDateTo` phải dạng `hh:mm:ss` trên URL.
 * Nên bọc `query` trong `useMemo` ở nơi gọi để đỡ fetch lặp không cần thiết.
 */
export function useRevenueReportOverview( filters: RevenueReportFilters ) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const overview: ReduxActionState<RevenueOverview> = useMicroAppSelector(selectRevenueOverview);
	const query = useMemo(() => revenueFiltersToBaseQuery(filters), [filters]);

	const refresh = useCallback(() => {
		if (!query) return;
		dispatch(revenueReportActions.fetchRevenueOverview(query));
	}, [dispatch, query]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const status = overview.status;
	const data = overview.data;
	const error = overview.error;
	const isLoading = (status === 'pending' || status === 'idle') && !data;

	return {
		data,
		status,
		error,
		isLoading,
		refresh,
	};
}

export function useRevenueReportByOrderTime(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation();
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByOrderTime);
	const groupTime = useMemo(() => timeRangeToGroupTime(filters.dateRange), [filters.dateRange]);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportByOrderTimeQuery({
			filters,
			groupTime,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { orderTime: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByOrderTime(q));
	}, [dispatch, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 500 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.missingDateRange'),
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
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportSuccess'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportFailed', { message }),
			});
		}
	}, [filters, translate]);

	const resetPageKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const list = useRevenueReportList<RevenueReportByOrderTime>(
		slice,
		selectRevenueByOrderTime,
		fetchList,
		{ resetPageKey },
	);

	return { ...list, handleExport, groupTime };
}


export function useRevenueTimeSeriesChart(filters: RevenueReportFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueTimeSeriesChart);
	const groupTime = useMemo(() => timeRangeToGroupTime(filters.dateRange), [filters.dateRange]);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportByOrderTimeQuery({
			filters,
			groupTime,
			pageQuery: { page: targetPage, size: pageSize },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueTimeSeriesChart(q));
	}, [dispatch, filters]);

	const resetPageKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const list = useRevenueReportList<RevenueReportByOrderTime>(
		slice,
		selectRevenueTimeSeriesChart,
		fetchList,
		{ resetPageKey, fallbackPageSize: 60 },
	);

	return { ...list, groupTime };
}


export function useRevenueReportByKiosk(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation();
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByKiosk);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByKiosk(q));
	}, [dispatch, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 1000 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.missingDateRange'),
			});
			return;
		}
		try {
			const blob = await revenueReportService.exportByKiosk({ ...query });
			triggerBlobDownload(blob, `Revenue-by-kiosk-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportSuccess'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportFailed', { message }),
			});
		}
	}, [filters, translate]);

	const list = useRevenueReportList<RevenueReportByKiosk>(
		slice,
		selectRevenueByKiosk,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);

	return { ...list, handleExport };
}

export function useRevenueReportByKioskChart(filters: RevenueReportFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByKioskChart);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 10 },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByKioskChart(q));
	}, [dispatch, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByKiosk[] = slice.items ?? [];
	const status = slice.status;
	const isLoading = !items.length && (status === 'pending' || status === 'idle');

	return { items, isLoading, error: slice.error, status };
}


export function useRevenueReportByProduct(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation();
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByProduct);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByProduct(q));
	}, [dispatch, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 1000 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.missingDateRange'),
			});
			return;
		}
		try {
			const blob = await revenueReportService.exportByProduct({ ...query });
			triggerBlobDownload(blob, `Revenue-by-product-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportSuccess'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportFailed', { message }),
			});
		}
	}, [filters, translate]);

	const list = useRevenueReportList<RevenueReportByProduct>(
		slice,
		selectRevenueByProduct,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);

	return { ...list, handleExport };
}

export function useRevenueReportByProductChart(filters: RevenueReportFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByProductChart);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 10 },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByProductChart(q));
	}, [dispatch, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByProduct[] = slice.items ?? [];
	const status = slice.status;
	const isLoading = !items.length && (status === 'pending' || status === 'idle');

	return { items, isLoading, error: slice.error, status };
}

export function useRevenueReportByCategoryChart(filters: RevenueReportFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByCategoryChart);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 10 },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByCategoryChart(q));
	}, [dispatch, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByCategory[] = slice.items ?? [];
	const status = slice.status;
	const isLoading = !items.length && (status === 'pending' || status === 'idle');

	return { items, isLoading, error: slice.error, status, overview: slice.overview };
}


export function useRevenueReportByCategory(filters: RevenueReportFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByCategory);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({ filters, pageQuery: { page: targetPage, size: pageSize } });
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByCategory(q));
	}, [dispatch, filters]);

	return useRevenueReportList<RevenueReportByCategory>(
		slice,
		selectRevenueByCategory,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);
}

export function useRevenueReportByPaymentMethodChart(filters: RevenueReportFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByPaymentMethodChart);
	const filtersKey = useMemo(() => revenueReportFiltersKey(filters), [filters]);

	const fetchChart = useCallback(() => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: 1, size: 100 }, //* get full list
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByPaymentMethodChart(q));
	}, [dispatch, filters]);

	useEffect(() => {
		fetchChart();
	}, [fetchChart, filtersKey]);

	const items: RevenueReportByPaymentMethod[] = slice.items ?? [];
	const status = slice.status;
	const isLoading = !items.length && (status === 'pending' || status === 'idle');

	return { items, isLoading, error: slice.error, status };
}


export function useRevenueReportByPaymentMethod(filters: RevenueReportFilters) {
	const { t: translate } = useTranslation();
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRevenueByPaymentMethod);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		const q = revenueReportListQuery({
			filters,
			pageQuery: { page: targetPage, size: pageSize },
			sortBy: { totalRevenue: 'desc' },
		});
		if (!q) return;
		dispatch(revenueReportActions.fetchRevenueByPaymentMethod(q));
	}, [dispatch, filters]);

	const handleExport = useCallback(async () => {
		const query = revenueReportListQuery({ filters, pageQuery: { page: 1, size: 50 }, download: true });
		if (!query) {
			notifications.show({
				color: 'yellow',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.missingDateRange'),
			});
			return;
		}
		try {
			const blob = await revenueReportService.exportByPaymentMethod({ ...query });
			triggerBlobDownload(blob, `Revenue-by-payment-method-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
			notifications.show({
				color: 'green',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportSuccess'),
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifications.show({
				color: 'red',
				title: translate('coremart.vendingMachine.reports.revenueReport.export'),
				message: translate('coremart.vendingMachine.reports.revenueReport.exportFailed', { message }),
			});
		}
	}, [filters, translate]);

	const list = useRevenueReportList<RevenueReportByPaymentMethod>(
		slice,
		selectRevenueByPaymentMethod,
		fetchList,
		{ resetPageKey: revenueReportFiltersKey(filters) },
	);

	return { ...list, handleExport };
}
