
import * as request from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';
import { SearchParamsOption } from 'ky';

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
import { buildSearchParams } from '../../../common/helpers';
import { vendingMachineStore } from '../../../store';



import type { PagedSearchResponse, PageQuery, ReportTimeQuery } from '../../../types';




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

/** Time range + bucket + paging, shared by the visitors and state-analytics reports. */
function bucketedTuples(query: KioskVisitorQuery | KioskAnalyticsQuery): string[][] {
	const tuples: string[][] = [
		...baseTimeRangeTuples(query),
		['bucket_type', query.bucketType],
		['page', String(query.page ?? 0)],
		['size', String(query.size ?? 30)],
	];
	query.kioskIds?.forEach((id) => tuples.push(['kiosk_ids', id]));
	return tuples;
}


/**
 * Kiosk operational statistics.
 *
 * Read-only, and **not** a `StoreCrudServiceBase` — reports have no dynamic-model schema. See
 * `InventoryReportService` for the reasoning.
 */
@storeService('OperationReportService', vendingMachineStore)
export class OperationReportService {
	@storeAsyncMethod
	public async getOperationalStats(query: ReportTimeQuery): Promise<OperationStats> {
		return fetchReport<OperationStats>('operational-stats', baseTimeRangeTuples(query));
	}

	@storeAsyncMethod
	public async getKioskStats(query: ReportTimeQuery): Promise<KioskStats> {
		return fetchReport<KioskStats>('kiosk-counts', baseTimeRangeTuples(query));
	}

	@storeAsyncMethod
	public async getLowStockWarnings(params: PageQuery): Promise<PagedSearchResponse<LowStockWarning>> {
		return fetchReport<PagedSearchResponse<LowStockWarning>>('low-stock-warnings', [
			['page', String(params.page)],
			['size', String(params.size)],
			['include_product', 'true'],
		]);
	}

	@storeAsyncMethod
	public async getKioskVisitors(query: KioskVisitorQuery): Promise<PagedSearchResponse<KioskVisitor>> {
		const tuples = bucketedTuples(query);
		return fetchReport<PagedSearchResponse<KioskVisitor>>('kiosk-visitors', tuples);
	}

	@storeAsyncMethod
	public async getKioskAnalytics(query: KioskAnalyticsQuery): Promise<PagedSearchResponse<KioskStateAnalytic>> {
		const tuples = bucketedTuples(query);
		return fetchReport<PagedSearchResponse<KioskStateAnalytic>>('kiosk-states', tuples);
	}

	@storeAsyncMethod
	public async getKioskWarnings(params: KioskWarningQuery): Promise<PagedSearchResponse<KioskWarning>> {
		const searchParams = buildSearchParams<KioskWarning>(params);
		return fetchReport<PagedSearchResponse<KioskWarning>>('kiosk-error-warnings', searchParams);
	}
}

export const operationReportService = new OperationReportService();
