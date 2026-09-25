
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
	type VendingMachineDispatch,
	refundReportActions,
	selectRefundByKiosk,
	selectRefundByPaymentMethod,
	selectRefundByProduct,
	selectRefundOrders,
	selectRefundOverview,
} from '@/appState';
import { triggerBlobDownload } from '@/common/helpers';
import { formatTimeQuery } from '@/common/helpers/format-time';
import { usePagination } from '@/common/hooks/usePagination';

import { refundReportService, REFUND_REPORT_DEFAULT_PAGE_SIZE } from '../refundReportService';

import type { RefundReportAppliedFilters } from '../components/RefundReport/type';
import type { BaseReportQuery } from '@/types';


function refundAppliedToBaseQuery(applied: RefundReportAppliedFilters): BaseReportQuery | null {
	const [start, end] = applied.dateRange ?? [];
	if (!start || !end) return null;
	const base: BaseReportQuery = {
		fromDate: dayjs(start).startOf('day').toISOString(),
		toDate: dayjs(end).endOf('day').toISOString(),
		timeOfDateFrom: formatTimeQuery(applied.timeSlot.from, '00:00:00'),
		timeOfDateTo: formatTimeQuery(applied.timeSlot.to, '23:59:59'),
	};
	if (applied.kioskId) return { ...base, kioskIds: [applied.kioskId] };
	return base;
}

function refundFiltersKey(applied: RefundReportAppliedFilters): string {
	const [start, end] = applied.dateRange ?? [];
	return [
		start ? dayjs(start).valueOf() : '',
		end ? dayjs(end).valueOf() : '',
		applied.kioskId ?? '',
		applied.timeSlot.from ?? '',
		applied.timeSlot.to ?? '',
	].join('|');
}


export function useRefundOverview(applied: RefundReportAppliedFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const overview = useMicroAppSelector(selectRefundOverview);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatch(refundReportActions.fetchRefundOverview(query));
	}, [dispatch, query]);

	return {
		data: overview.data ?? null,
		isLoading: overview.status === 'pending' || overview.status === 'idle',
		error: overview.error,
	};
}


export function useRefundByKiosk(applied: RefundReportAppliedFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRefundByKiosk);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatch(refundReportActions.fetchRefundByKiosk(query));
	}, [dispatch, query]);

	return {
		items: slice.items,
		isLoading: slice.status === 'pending' || slice.status === 'idle',
		error: slice.error,
	};
}


export function useRefundByPaymentMethod(applied: RefundReportAppliedFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRefundByPaymentMethod);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatch(refundReportActions.fetchRefundByPaymentMethod(query));
	}, [dispatch, query]);

	return {
		items: slice.items,
		isLoading: slice.status === 'pending' || slice.status === 'idle',
		error: slice.error,
	};
}


export function useRefundByProduct(applied: RefundReportAppliedFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const slice = useMicroAppSelector(selectRefundByProduct);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatch(refundReportActions.fetchRefundByProduct(query));
	}, [dispatch, query]);

	return {
		items: slice.items,
		isLoading: slice.status === 'pending' || slice.status === 'idle',
		error: slice.error,
	};
}


export function useRefundOrders(applied: RefundReportAppliedFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const { t: translate } = useTranslation();
	const slice = useMicroAppSelector(selectRefundOrders);

	const filtersKey = useMemo(() => refundFiltersKey(applied), [applied]);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		if (!query) return;
		dispatch(refundReportActions.fetchRefundOrders({ ...query, page: targetPage - 1, size: pageSize }));
	}, [dispatch, query]);

	const pagination = usePagination(fetchList, selectRefundOrders, {
		fallbackPageSize: REFUND_REPORT_DEFAULT_PAGE_SIZE,
		resetPageKey: filtersKey,
	});


	useEffect(() => {
		fetchList(pagination.page, pagination.pageSize);
	}, [fetchList]);

	const handleExport = useCallback(async () => {
		if (!query) return;
		try {
			const blob = await refundReportService.exportOrders({ ...query, page: 0, size: 10_000 });
			triggerBlobDownload(blob, `Refund-orders-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
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
	}, [query, translate]);



	const items = slice.items;
	const isLoading = (slice.status === 'pending' || slice.status === 'idle') && !items.length;

	return {
		items,
		isLoading,
		error: slice.error,
		pagination,
		handleExport,
	};
}
