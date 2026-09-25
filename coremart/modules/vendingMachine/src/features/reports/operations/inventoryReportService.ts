import * as request from '@nikkierp/common/request';
import { ky } from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';

import type { ProductInventoryReport } from './components/InventoryReport/type';
import type { PagedSearchResponse } from '@/types';


const BASE_PATH = 'report/inventory';
export const INVENTORY_REPORT_DEFAULT_PAGE_SIZE = 20;

function kioskIdsTuples(kioskIds?: string[]): string[][] {
	if (!kioskIds?.length) return [];
	return kioskIds.flatMap((id) => [['kiosk_ids', id]]);
}

export type InventoryReportQuery = {
	kioskIds?: string[];
	page?: number;
	size?: number;
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

export const inventoryReportService = {
	async getProducts(query: InventoryReportQuery): Promise<PagedSearchResponse<ProductInventoryReport>> {
		return fetchProducts(buildTuples(query));
	},

	async exportProducts(query: InventoryReportQuery): Promise<Blob> {
		return getBlob(buildTuples(query));
	},
};
