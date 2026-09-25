import * as request from '@nikkierp/common/request';
import { ky } from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { vendingMachineStore } from '../../../store';

import type { ProductInventoryReport } from './components/InventoryReport/type';
import type { PagedSearchResponse } from '../../../types';


const BASE_PATH = 'report/inventory';
export const INVENTORY_REPORT_DEFAULT_PAGE_SIZE = 20;

function kioskIdsTuples(kioskIds?: string[]): string[][] {
	if (!kioskIds?.length) return [];
	return kioskIds.flatMap((id) => [['kiosk_ids', id]]);
}

export type InventoryReportQuery = {
	kioskIds?: string[],
	page?: number,
	size?: number,
};

function buildTuples(query: InventoryReportQuery): string[][] {
	const t: string[][] = [
		['page', String(query.page ?? 0)],
		['size', String(query.size ?? INVENTORY_REPORT_DEFAULT_PAGE_SIZE)],
	];
	t.push(...kioskIdsTuples(query.kioskIds));
	return t;
}

async function fetchProducts(tuples: string[][]): Promise<PagedSearchResponse<ProductInventoryReport>> {
	const result = await request.get<unknown>(`${BASE_PATH}/by-product`, { searchParams: tuples });
	return snakeToCamelObject(result) as PagedSearchResponse<ProductInventoryReport>;
}

async function getBlob(tuples: string[][]): Promise<Blob> {
	const client = ky();
	if (!client) throw new Error('API client not initialized');
	return client
		.get(`${BASE_PATH}/by-product/export`, { searchParams: tuples, headers: { Accept: '*/*' } })
		.blob();
}

/**
 * Inventory report.
 *
 * Read-only, and **not** a `StoreCrudServiceBase` — reports have no dynamic-model schema. A plain
 * `@storeService` still gets a module-store slice and `useServiceLayer`; it just has no
 * schema-driven CRUD and emits no events (there is nothing to invalidate — nothing mutates).
 *
 * `report/*` is absent from the vending_machine route table; per the module's standing ruling
 * that is unbuilt UI rather than a missing endpoint, so it is wired as if it exists.
 */
@storeService('InventoryReportService', vendingMachineStore)
export class InventoryReportService {
	@storeAsyncMethod
	public async getProducts(query: InventoryReportQuery): Promise<PagedSearchResponse<ProductInventoryReport>> {
		return fetchProducts(buildTuples(query));
	}

	/**
	 * Same call as {@link getProducts}, deliberately a **separate method**.
	 *
	 * Service-layer state is keyed by `{sliceName}.{methodName}`, so the chart (one large page)
	 * and the table (the user's page) would overwrite each other's results if both went through
	 * `getProducts`. Under the old slice these were two distinct state keys; this preserves that.
	 */
	@storeAsyncMethod
	public async getChartProducts(
		query: InventoryReportQuery,
	): Promise<PagedSearchResponse<ProductInventoryReport>> {
		return fetchProducts(buildTuples(query));
	}

	/** Not annotated: a Blob download is not state, so it must not be cached in the store. */
	public async exportProducts(query: InventoryReportQuery): Promise<Blob> {
		return getBlob(buildTuples(query));
	}
}

export const inventoryReportService = new InventoryReportService();
