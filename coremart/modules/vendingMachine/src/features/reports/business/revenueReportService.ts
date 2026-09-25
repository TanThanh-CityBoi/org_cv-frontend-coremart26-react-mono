import * as request from '@nikkierp/common/request';
import { ky } from '@nikkierp/common/request';
import { camelToSnakeCase, snakeToCamelObject } from '@nikkierp/common/utils';

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
} from '@/types';



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

export const revenueReportService = {
	async getOverview(query: RevenueReportOverviewQuery): Promise<RevenueOverview> {
		const tuples = baseReportTuples(query);
		const result = await request.get<RevenueOverview>(`${BASE_PATH}/overview`, { searchParams: tuples });
		return snakeToCamelObject(result) as RevenueOverview;
	},

	async getByHour(query: RevenueReportByHourQuery): Promise<RevenueReport<RevenueReportByHour>> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return fetchRevenueReport<RevenueReportByHour>('by-hour', tuples);
	},

	async getByOrderTime(
		query: RevenueReportByOrderTimeQuery,
	): Promise<RevenueReport<RevenueReportByOrderTime>> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return fetchRevenueReport<RevenueReportByOrderTime>('by-order-time', tuples);
	},

	async getByKiosk(query: RevenueReportByKioskQuery): Promise<RevenueReport<RevenueReportByKiosk>> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return fetchRevenueReport<RevenueReportByKiosk>('by-kiosk', tuples);
	},

	async getByProduct(query: RevenueReportByProductQuery): Promise<RevenueReport<RevenueReportByProduct>> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return fetchRevenueReport<RevenueReportByProduct>('by-product', tuples);
	},

	async getByCategory(query: RevenueReportByCategoryQuery): Promise<RevenueReport<RevenueReportByCategory>> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return fetchRevenueReport<RevenueReportByCategory>('by-category', tuples);
	},

	async getByPaymentMethod(
		query: RevenueReportByPaymentMethodQuery,
	): Promise<RevenueReport<RevenueReportByPaymentMethod>> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return fetchRevenueReport<RevenueReportByPaymentMethod>('by-payment-method', tuples);
	},

	async exportByHour(query: BaseReportQuery): Promise<Blob> {
		const tuples = [...baseReportTuples(query), ['download', 'true']];
		return getReportBlob('by-hour/export', tuples);
	},

	async exportByOrderTime(query: RevenueReportByOrderTimeQuery): Promise<Blob> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return getReportBlob('by-order-time/export', tuples);
	},

	async exportByKiosk(query: RevenueReportByKioskQuery): Promise<Blob> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return getReportBlob('by-kiosk/export', tuples);
	},

	async exportByProduct(query: RevenueReportByProductQuery): Promise<Blob> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return getReportBlob('by-product/export', tuples);
	},

	async exportByCategory(query: RevenueReportByCategoryQuery): Promise<Blob> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return getReportBlob('by-category/export', tuples);
	},

	async exportByPaymentMethod(query: RevenueReportByPaymentMethodQuery): Promise<Blob> {
		const tuples = revenueReportTuples(query);
		pushPagedFields(tuples, query);
		return getReportBlob('by-payment-method/export', tuples);
	},
};
