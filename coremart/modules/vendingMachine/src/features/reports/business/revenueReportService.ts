import * as request from '@nikkierp/common/request';
import { ky } from '@nikkierp/common/request';
import { camelToSnakeCase, snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { vendingMachineStore } from '../../../store';

import type {
	RevenueOverview,
	RevenueReport,
	RevenueReportByCategory,
	RevenueReportByHour,
	RevenueReportByKiosk,
	RevenueReportByOrderTime,
	RevenueReportByPaymentMethod,
	RevenueReportByProduct,
} from './type';
import type {
	BaseReportQuery,
	GroupTimeQuery,
	ListReportQuery,
	RevenueReportByCategoryQuery,
	RevenueReportByHourQuery,
	RevenueReportByKioskQuery,
	RevenueReportByOrderTimeQuery,
	RevenueReportByPaymentMethodQuery,
	RevenueReportByProductQuery,
	RevenueReportOverviewQuery,
} from '../../../types';



const BASE_PATH = 'report/revenue';

export const REVENUE_REPORT_DEFAULT_PAGE_SIZE = 10;


function kioskIdsTuples(kioskIds?: string[]): string[][] {
	if (!kioskIds?.length) return [];
	return kioskIds.flatMap((id) => [['kiosk_ids', id]]);
}

function pushPagedFields(tuples: string[][], query: ListReportQuery): void {
	const page = query.page ?? 0;
	const size = query.size ?? REVENUE_REPORT_DEFAULT_PAGE_SIZE;
	tuples.push(['page', String(page)], ['size', String(size)], ['download', String(query.download ?? false)]);
}

/** Query chung (snake_case) cho báo cáo doanh thu; `group_time` chỉ có khi gửi xuống BE. */
function revenueReportTuples(query: ListReportQuery & GroupTimeQuery): string[][] {
	const tuples: string[][] = [
		['from_date', query.fromDate],
		['to_date', query.toDate],
		['time_of_date_from', query.timeOfDateFrom ?? '00:00:00'],
		['time_of_date_to', query.timeOfDateTo ?? '23:59:59'],
	];
	if (query.groupTime) {
		tuples.push(['group_time', query.groupTime]);
	}
	if (query.sort) {
		tuples.push(['sort', JSON.stringify(query.sort?.map((s) => ({ field: camelToSnakeCase(s.field), direction: s.direction })))]);
	}
	tuples.push(...kioskIdsTuples(query.kioskIds));
	return tuples;
}

function baseReportTuples(query: BaseReportQuery): string[][] {
	return [
		['from_date', query.fromDate],
		['to_date', query.toDate],
		['time_of_date_from', query.timeOfDateFrom ?? '00:00:00'],
		['time_of_date_to', query.timeOfDateTo ?? '23:59:59'],
		...kioskIdsTuples(query.kioskIds),
	];
}

async function getReportBlob(endpoint: string, searchParams: string[][]): Promise<Blob> {
	const client = ky();
	if (!client) throw new Error('API client not initialized');
	return client.get(`${BASE_PATH}/${endpoint}`, {
		searchParams,
		headers: { Accept: '*/*' },
	}).blob();
}

async function fetchRevenueReport<R>(endpoint: string, searchParams: string[][]): Promise<RevenueReport<R>> {
	const result = await request.get<unknown>(`${BASE_PATH}/${endpoint}`, { searchParams });
	return snakeToCamelObject(result) as RevenueReport<R>;
}

/** Every paged revenue breakdown builds its query the same way. */
function pagedTuples(query: ListReportQuery & GroupTimeQuery): string[][] {
	const tuples = revenueReportTuples(query);
	pushPagedFields(tuples, query);
	return tuples;
}


/**
 * Revenue report.
 *
 * Read-only, and **not** a `StoreCrudServiceBase` — reports have no dynamic-model schema. See
 * `InventoryReportService` for the reasoning.
 *
 * The `export*` methods are deliberately **unannotated**: a Blob download is not state, so it
 * must not be cached in the store. Call them directly, not through `useServiceLayer`.
 */
@storeService('RevenueReportService', vendingMachineStore)
export class RevenueReportService {
	@storeAsyncMethod
	public async getOverview(query: RevenueReportOverviewQuery): Promise<RevenueOverview> {
		const result = await request.get<RevenueOverview>(`${BASE_PATH}/overview`, {
			searchParams: baseReportTuples(query),
		});
		return snakeToCamelObject(result) as RevenueOverview;
	}

	@storeAsyncMethod
	public async getByHour(query: RevenueReportByHourQuery): Promise<RevenueReport<RevenueReportByHour>> {
		return fetchRevenueReport<RevenueReportByHour>('by-hour', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByOrderTime(
		query: RevenueReportByOrderTimeQuery,
	): Promise<RevenueReport<RevenueReportByOrderTime>> {
		return fetchRevenueReport<RevenueReportByOrderTime>('by-order-time', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByKiosk(query: RevenueReportByKioskQuery): Promise<RevenueReport<RevenueReportByKiosk>> {
		return fetchRevenueReport<RevenueReportByKiosk>('by-kiosk', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByProduct(query: RevenueReportByProductQuery): Promise<RevenueReport<RevenueReportByProduct>> {
		return fetchRevenueReport<RevenueReportByProduct>('by-product', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByCategory(
		query: RevenueReportByCategoryQuery,
	): Promise<RevenueReport<RevenueReportByCategory>> {
		return fetchRevenueReport<RevenueReportByCategory>('by-category', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByPaymentMethod(
		query: RevenueReportByPaymentMethodQuery,
	): Promise<RevenueReport<RevenueReportByPaymentMethod>> {
		return fetchRevenueReport<RevenueReportByPaymentMethod>('by-payment-method', pagedTuples(query));
	}

	/**
	 * Chart-only twins of the breakdown queries above. Same calls — deliberately **separate
	 * methods**.
	 *
	 * Service-layer state is keyed by `{sliceName}.{methodName}`, so a chart (one large page) and
	 * its table (the user's page) would overwrite each other's results if both went through the
	 * same method. The old slice gave each its own key via a dedicated thunk; this preserves that.
	 */
	@storeAsyncMethod
	public async getTimeSeriesChart(
		query: RevenueReportByOrderTimeQuery,
	): Promise<RevenueReport<RevenueReportByOrderTime>> {
		return fetchRevenueReport<RevenueReportByOrderTime>('by-order-time', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByKioskChart(query: RevenueReportByKioskQuery): Promise<RevenueReport<RevenueReportByKiosk>> {
		return fetchRevenueReport<RevenueReportByKiosk>('by-kiosk', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByProductChart(
		query: RevenueReportByProductQuery,
	): Promise<RevenueReport<RevenueReportByProduct>> {
		return fetchRevenueReport<RevenueReportByProduct>('by-product', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByCategoryChart(
		query: RevenueReportByCategoryQuery,
	): Promise<RevenueReport<RevenueReportByCategory>> {
		return fetchRevenueReport<RevenueReportByCategory>('by-category', pagedTuples(query));
	}

	@storeAsyncMethod
	public async getByPaymentMethodChart(
		query: RevenueReportByPaymentMethodQuery,
	): Promise<RevenueReport<RevenueReportByPaymentMethod>> {
		return fetchRevenueReport<RevenueReportByPaymentMethod>('by-payment-method', pagedTuples(query));
	}

	public async exportByHour(query: BaseReportQuery): Promise<Blob> {
		return getReportBlob('by-hour/export', [...baseReportTuples(query), ['download', 'true']]);
	}

	public async exportByOrderTime(query: RevenueReportByOrderTimeQuery): Promise<Blob> {
		return getReportBlob('by-order-time/export', pagedTuples(query));
	}

	public async exportByKiosk(query: RevenueReportByKioskQuery): Promise<Blob> {
		return getReportBlob('by-kiosk/export', pagedTuples(query));
	}

	public async exportByProduct(query: RevenueReportByProductQuery): Promise<Blob> {
		return getReportBlob('by-product/export', pagedTuples(query));
	}

	public async exportByCategory(query: RevenueReportByCategoryQuery): Promise<Blob> {
		return getReportBlob('by-category/export', pagedTuples(query));
	}

	public async exportByPaymentMethod(query: RevenueReportByPaymentMethodQuery): Promise<Blob> {
		return getReportBlob('by-payment-method/export', pagedTuples(query));
	}
}

export const revenueReportService = new RevenueReportService();
