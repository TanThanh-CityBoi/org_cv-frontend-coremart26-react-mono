import * as request from '@nikkierp/common/request';
import { ky } from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';

import { RefundReport } from './type';

import type {
	KioskRefundReport,
	OrderRefundReport,
	PaymentMethodRefundReport,
	ProductRefundReport,
	RefundOverview,
} from './components/RefundReport/type';
import type {
	RefundReportByKioskQuery,
	RefundReportByPaymentMethodQuery,
	RefundReportByProductQuery,
	RefundReportOrdersQuery,
	RefundReportOverviewQuery,
} from '@/types';


const BASE_PATH = 'report/refund';
export const REFUND_REPORT_DEFAULT_PAGE_SIZE = 10;

export type RefundListResponse<R> = {
	items: R[];
	total: number;
	page: number;
	size: number;
};

function baseTuples(q: RefundReportOverviewQuery): string[][] {
	const t: string[][] = [
		['from_date', q.fromDate],
		['to_date', q.toDate],
		['time_of_date_from', q.timeOfDateFrom ?? '00:00:00'],
		['time_of_date_to', q.timeOfDateTo ?? '23:59:59'],
	];
	q.kioskIds?.forEach((id) => t.push(['kiosk_ids', id]));
	return t;
}

async function getBlob(endpoint: string, params: string[][]): Promise<Blob> {
	const client = ky();
	if (!client) throw new Error('API client not initialized');
	return client.get(`${BASE_PATH}/${endpoint}`, { searchParams: params, headers: { Accept: '*/*' } }).blob();
}

async function fetchList<R>(endpoint: string, params: string[][]): Promise<RefundReport<R>> {
	const result = await request.get<unknown>(`${BASE_PATH}/${endpoint}`, { searchParams: params });
	return snakeToCamelObject(result) as RefundReport<R>;
}

export const refundReportService = {
	async getOverview(q: RefundReportOverviewQuery): Promise<RefundOverview> {
		const result = await request.get<RefundOverview>(`${BASE_PATH}/overview`, { searchParams: baseTuples(q) });
		return snakeToCamelObject(result) as RefundOverview;
	},

	async getByKiosk(q: RefundReportByKioskQuery): Promise<RefundReport<KioskRefundReport>> {
		const res = await fetchList<KioskRefundReport>('by-kiosk', baseTuples(q));
		return res;
	},

	async getByPaymentMethod(q: RefundReportByPaymentMethodQuery):
	Promise<RefundReport<PaymentMethodRefundReport>> {
		const res = await fetchList<PaymentMethodRefundReport>('by-payment-method', baseTuples(q));
		return res;
	},

	async getByProduct(q: RefundReportByProductQuery): Promise<RefundReport<ProductRefundReport>> {
		const res = await fetchList<ProductRefundReport>('by-product', baseTuples(q));
		return res;
	},

	async getOrders(q: RefundReportOrdersQuery): Promise<RefundReport<OrderRefundReport>> {
		const t = baseTuples(q);
		t.push(
			['page', String(q.page ?? 0)],
			['size', String(q.size ?? REFUND_REPORT_DEFAULT_PAGE_SIZE)],
		);
		const res = await fetchList<OrderRefundReport>('by-order', t);
		return res;
	},

	async exportOrders(q: RefundReportOrdersQuery): Promise<Blob> {
		return getBlob('by-order/export', baseTuples(q));
	},
};
