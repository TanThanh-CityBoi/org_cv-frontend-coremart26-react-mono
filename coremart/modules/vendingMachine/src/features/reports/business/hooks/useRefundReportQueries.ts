
import { notifications } from '@mantine/notifications';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { triggerBlobDownload } from '../../../../common/helpers';
import { formatTimeQuery } from '../../../../common/helpers/format-time';
import { usePaginationWithTotal } from '../../../../common/hooks/usePagination';
import { refundReportService, REFUND_REPORT_DEFAULT_PAGE_SIZE } from '../refundReportService';

import type { BaseReportQuery } from '../../../../types';
import type {
	KioskRefundReport,
	OrderRefundReport,
	PaymentMethodRefundReport,
	ProductRefundReport,
	RefundReportAppliedFilters,
} from '../components/RefundReport/type';


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
	const { dispatchMethod, result } = useServiceLayer(refundReportService.getOverview);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatchMethod(query);
	}, [dispatchMethod, query]);

	return {
		data: result.data ?? null,
		isLoading: result.isPending || result.doneAt == null,
		error: result.error,
	};
}


export function useRefundByKiosk(applied: RefundReportAppliedFilters) {
	const { dispatchMethod, result } = useServiceLayer<{ items: KioskRefundReport[] }>(
		refundReportService.getByKiosk,
	);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatchMethod(query);
	}, [dispatchMethod, query]);

	return {
		// Default to `[]`: the slice these replaced always exposed an array.
		items: result.data?.items ?? [],
		isLoading: result.isPending || result.doneAt == null,
		error: result.error,
	};
}


export function useRefundByPaymentMethod(applied: RefundReportAppliedFilters) {
	const { dispatchMethod, result } = useServiceLayer<{ items: PaymentMethodRefundReport[] }>(
		refundReportService.getByPaymentMethod,
	);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatchMethod(query);
	}, [dispatchMethod, query]);

	return {
		// Default to `[]`: the slice these replaced always exposed an array.
		items: result.data?.items ?? [],
		isLoading: result.isPending || result.doneAt == null,
		error: result.error,
	};
}


export function useRefundByProduct(applied: RefundReportAppliedFilters) {
	const { dispatchMethod, result } = useServiceLayer<{ items: ProductRefundReport[] }>(
		refundReportService.getByProduct,
	);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	useEffect(() => {
		if (!query) return;
		dispatchMethod(query);
	}, [dispatchMethod, query]);

	return {
		// Default to `[]`: the slice these replaced always exposed an array.
		items: result.data?.items ?? [],
		isLoading: result.isPending || result.doneAt == null,
		error: result.error,
	};
}


export function useRefundOrders(applied: RefundReportAppliedFilters) {
	const { t: translate } = useTranslation('vending_machine');
	const { dispatchMethod, result } = useServiceLayer<{ items: OrderRefundReport[], total: number }>(
		refundReportService.getOrders,
	);

	const filtersKey = useMemo(() => refundFiltersKey(applied), [applied]);
	const query = useMemo(() => refundAppliedToBaseQuery(applied), [applied]);

	const fetchList = useCallback((targetPage: number, pageSize: number) => {
		if (!query) return;
		dispatchMethod({ ...query, page: targetPage - 1, size: pageSize });
	}, [dispatchMethod, query]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
		fallbackPageSize: REFUND_REPORT_DEFAULT_PAGE_SIZE,
		resetPageKey: filtersKey,
	});
	const { page, pageSize } = pagination;

	useEffect(() => {
		fetchList(page, pageSize);
	}, [fetchList, page, pageSize]);

	const handleExport = useCallback(async () => {
		if (!query) return;
		try {
			const blob = await refundReportService.exportOrders({ ...query, page: 0, size: 10_000 });
			triggerBlobDownload(blob, `Refund-orders-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
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
	}, [query, translate]);



	const items = result.data?.items ?? [];
	const isLoading = (result.isPending || result.doneAt == null) && !items.length;

	return {
		items,
		isLoading,
		error: result.error,
		pagination,
		handleExport,
	};
}
