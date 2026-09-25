import * as request from '@nikkierp/common/request';
import { ky } from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { RefundReport } from './type';
import { vendingMachineStore } from '../../../store';


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
} from '../../../types';


const BASE_PATH = 'report/refund';
export const REFUND_REPORT_DEFAULT_PAGE_SIZE = 10;

export type RefundListResponse<R> = {
	items: R[],
	total: number,
	page: number,
	size: number,
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

/**
 * Refund report.
 *
 * Read-only, and **not** a `StoreCrudServiceBase` — reports have no dynamic-model schema. See
 * `InventoryReportService` for the reasoning.
 */
@storeService('RefundReportService', vendingMachineStore)
export class RefundReportService {
	@storeAsyncMethod
	public async getOverview(query: RefundReportOverviewQuery): Promise<RefundOverview> {
		const result = await request.get<RefundOverview>(`${BASE_PATH}/overview`, {
			searchParams: baseTuples(query),
		});
		return snakeToCamelObject(result) as RefundOverview;
	}

	@storeAsyncMethod
	public async getByKiosk(query: RefundReportByKioskQuery): Promise<RefundReport<KioskRefundReport>> {
		return fetchList<KioskRefundReport>('by-kiosk', baseTuples(query));
	}

	@storeAsyncMethod
	public async getByPaymentMethod(
		query: RefundReportByPaymentMethodQuery,
	): Promise<RefundReport<PaymentMethodRefundReport>> {
		return fetchList<PaymentMethodRefundReport>('by-payment-method', baseTuples(query));
	}

	@storeAsyncMethod
	public async getByProduct(query: RefundReportByProductQuery): Promise<RefundReport<ProductRefundReport>> {
		return fetchList<ProductRefundReport>('by-product', baseTuples(query));
	}

	@storeAsyncMethod
	public async getOrders(query: RefundReportOrdersQuery): Promise<RefundReport<OrderRefundReport>> {
		const tuples = baseTuples(query);
		tuples.push(
			['page', String(query.page ?? 0)],
			['size', String(query.size ?? REFUND_REPORT_DEFAULT_PAGE_SIZE)],
		);
		return fetchList<OrderRefundReport>('by-order', tuples);
	}

	/** Not annotated: a Blob download is not state, so it must not be cached in the store. */
	public async exportOrders(query: RefundReportOrdersQuery): Promise<Blob> {
		return getBlob('by-order/export', baseTuples(query));
	}
}

export const refundReportService = new RefundReportService();
