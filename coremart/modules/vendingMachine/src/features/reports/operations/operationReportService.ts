
import * as request from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';


import {
	KioskAnalyticsQuery,
	KioskStateAnalytic,
	KioskStats,
	KioskVisitor,
	KioskVisitorQuery,
	KioskWarning,
	KioskWarningQuery,
	LowStockWarning,
	OperationStats,
} from './type';

import type { PagedSearchResponse, PageQuery, ReportTimeQuery } from '@/types';
import { buildSearchParams } from '@/common/helpers';
import { SearchParamsOption } from 'ky';


const BASE_PATH = 'vending-machine/kiosk-stats';


function baseTimeRangeTuples(query: Pick<ReportTimeQuery, 'fromDate' | 'toDate'>): string[][] {
	return [
		['from_date', query.fromDate],
		['to_date', query.toDate],
	];
}

async function fetchReport<R>(endpoint: string, searchParams?: SearchParamsOption): Promise<R> {
	const result = await request.get<unknown>(`${BASE_PATH}/${endpoint}`, { searchParams: searchParams ?? [] });
	return snakeToCamelObject(result) as R;
}

export const operationReportService = {
	async getOperationalStats(query: ReportTimeQuery): Promise<OperationStats> {
		const tuples = baseTimeRangeTuples(query);
		return fetchReport<OperationStats>('operational-stats', tuples);
	},

	async getKioskStats(query: ReportTimeQuery): Promise<KioskStats> {
		const tuples = baseTimeRangeTuples(query);
		return fetchReport<KioskStats>('kiosk-counts', tuples);
	},

	async getLowStockWarnings(params: PageQuery): Promise<PagedSearchResponse<LowStockWarning>> {
		return fetchReport<PagedSearchResponse<LowStockWarning>>('low-stock-warnings', [
			['page', String(params.page)],
			['size', String(params.size)],
			['include_product', 'true'],
		]);
	},

	async getKioskVisitors(query: KioskVisitorQuery): Promise<PagedSearchResponse<KioskVisitor>> {
		const tuples: string[][] = [
			...baseTimeRangeTuples(query),
			['bucket_type', query.bucketType],
			['page', String(query.page ?? 0)],
			['size', String(query.size ?? 30)],
		];
		query.kioskIds?.forEach(id => tuples.push(['kiosk_ids', id]));
		return fetchReport<PagedSearchResponse<KioskVisitor>>('kiosk-visitors', tuples);
	},

	async getKioskAnalytics(query: KioskAnalyticsQuery): Promise<PagedSearchResponse<KioskStateAnalytic>> {
		const tuples: string[][] = [
			...baseTimeRangeTuples(query),
			['bucket_type', query.bucketType],
			['page', String(query.page ?? 0)],
			['size', String(query.size ?? 30)],
		];
		query.kioskIds?.forEach(id => tuples.push(['kiosk_ids', id]));
		return fetchReport<PagedSearchResponse<KioskStateAnalytic>>('kiosk-states', tuples);
	},

	async getKioskWarnings(params: KioskWarningQuery): Promise<PagedSearchResponse<KioskWarning>> {
		const searchParams = buildSearchParams<KioskWarning>(params);
		return fetchReport<PagedSearchResponse<KioskWarning>>('kiosk-error-warnings', searchParams);
	},
};
