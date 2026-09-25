import * as request from '@nikkierp/common/request';
import { snakeToCamelObject, camelToSnakeObject, cleanEmptyString } from '@nikkierp/common/utils';


import { buildFieldsQuery, buildSearchParams } from '@/common/helpers';

import { Kiosk, KioskLog } from './types';

import type { KioskStock } from './components/KioskDetail/KioskStockGrid/kioskStock.types';
import type { KioskCreatePayload } from './hooks/useKioskCreate';
import type { KioskUpdatePayload } from './hooks/useKioskEdit';
import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	RestArchiveResponse,
	PagedSearchResponse,
	SearchParams,
} from '@/types';



const BASE_PATH = 'vending-machine/kiosks';

export type CreateKioskStockBody = {
	productRef: string;
	sortIndex: number;
	sellPrice: string;
	warningQuantity?: number;
};

/** PUT …/kiosks/:kioskId/kiosk-stocks/:id (Bruno `Kiosk Stock - Update`). */
export type UpdateKioskStockBody = {
	etag: string;
	sortIndex: number;
	sellPrice: string;
	warningQuantity?: number;
};

/**
 * [PUT] …/kiosks/:kioskId/positions item (wire: snake_case, e.g. stock_ref, is_enabled).
 * Cleared position: only row+col, other fields null.
 */
export type KioskPositionUpdateItem = {
	row: string;
	col: number;
	stockRef: string | null;
	quantity?: number;
	maxQuantity?: number;
	isEnabled?: boolean;
};

export const kioskService = {
	async searchKiosks(params?: SearchParams<Kiosk>): Promise<PagedSearchResponse<Kiosk>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<Kiosk>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Kiosk>;
	},

	async getKiosk(id: string, fields?: Array<keyof Kiosk>): Promise<Kiosk> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: buildFieldsQuery<Kiosk>(fields ?? []),
		});
		return snakeToCamelObject(result) as Kiosk;
	},

	async createKiosk(body: KioskCreatePayload): Promise<RestCreateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);

		const result = await request.post<any>(BASE_PATH, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateKiosk({ id, body }: KioskUpdatePayload): Promise<RestUpdateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);

		const result = await request.put<any>(`${BASE_PATH}/${id}`, { json: snakeBody });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deleteKiosk(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setArchivedKiosk(id: string, body: { etag: string; isArchived: boolean }): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, { json: snakeBody });
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	async searchKioskLogs(params?: SearchParams<KioskLog>): Promise<PagedSearchResponse<KioskLog>> {
		const result = await request.get<any>('vending-machine/kiosk-logs', {
			searchParams: buildSearchParams<KioskLog>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<KioskLog>;
	},

	/**
	 * GET …/kiosks/:kioskId/kiosk-stocks — Bruno `Kiosk Stock - Search`.
	 * Defaults: page 0, size 100, `include_product=true`, fields `positions` + `product_ref`.
	 */
	async searchKioskStocks(
		kioskId: string,
		params?: SearchParams<KioskStock>,
	): Promise<PagedSearchResponse<KioskStock>> {
		const result = await request.get<any>(`${BASE_PATH}/${kioskId}/kiosk-stocks`, {
			searchParams: buildSearchParams<KioskStock>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<KioskStock>;
	},

	/**
	 * POST …/kiosks/:kioskId/kiosk-stocks (Bruno `Kiosk Stock - Create`).
	 * Body: `product_ref`, `sort_index`, `sell_price`.
	 */
	async createKioskStock(
		kioskId: string,
		body: CreateKioskStockBody,
	): Promise<RestCreateResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<any>(
			`${BASE_PATH}/${kioskId}/kiosk-stocks`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	/**
	 * POST …/kiosks/:kioskId/kiosk-stocks/bulk (Bruno `Kiosk Stock - Create Bulk`).
	 * Body: JSON array of `product_ref`, `sort_index`, `sell_price`.
	 */
	async bulkCreateKioskStocks(
		kioskId: string,
		items: CreateKioskStockBody[],
	): Promise<RestCreateResponse[]> {
		const snakeBody = camelToSnakeObject(items);
		const result = await request.post<any>(
			`${BASE_PATH}/${kioskId}/kiosk-stocks/bulk`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestCreateResponse[];
	},

	async updateKioskStock(
		kioskId: string,
		stockId: string,
		body: UpdateKioskStockBody,
	): Promise<RestUpdateResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.put<any>(
			`${BASE_PATH}/${kioskId}/kiosk-stocks/${stockId}`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	/** DELETE …/kiosks/:kioskId/kiosk-stocks/:id (Bruno `Kiosk Stock - Delete`). */
	async deleteKioskStock(
		kioskId: string,
		stockId: string,
	): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${kioskId}/kiosk-stocks/${stockId}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	/** PUT …/kiosks/:id/kiosk-stocks/replace — full replace shelf layout for one kiosk. */
	async replaceKioskStocks(
		kioskId: string,
		body: KioskStockReplaceRequest,
	): Promise<unknown> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.put<any>(
			`${BASE_PATH}/${kioskId}/kiosk-stocks/replace`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result);
	},

	/** [PATCH] …/kiosks/:kioskId/kiosk-stocks/bulk — bulk update sort_index / warning_quantity. */
	async bulkUpdateKioskStocks(
		kioskId: string,
		items: BulkUpdateKioskStockItem[],
	): Promise<unknown> {
		const snakeBody = items.map((item) => camelToSnakeObject(item));
		const result = await request.patch<any>(
			`${BASE_PATH}/${kioskId}/kiosk-stocks/bulk`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result);
	},

	/** [PATCH] …/kiosks/:kioskId/positions/upsert — partial position updates. */
	async updateKioskPositions(
		kioskId: string,
		positions: KioskPositionUpdateItem[],
	): Promise<unknown> {
		const snakeBody = positions.map((item) => camelToSnakeObject(item));
		const result = await request.patch<any>(
			`${BASE_PATH}/${kioskId}/positions/upsert`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result);
	},
};

/** PATCH …/kiosk-stocks/bulk body item. */
export type BulkUpdateKioskStockItem = {
	id: string;
	etag: string;
	sortIndex: number;
	warningQuantity?: number;
};

/** Matches Bruno `Kiosk Stock - Replace` body (`stocks` → snake_case on the wire). */
export type KioskStockReplacePosition = {
	row: string;
	col: number;
	quantity: number;
	maxQuantity: number;
	status: 'enable' | 'disable';
};

export type KioskStockReplaceLine = {
	productRef: string;
	sortIndex: number;
	sellPrice: string;
	positions: KioskStockReplacePosition[];
};

export type KioskStockReplaceRequest = {
	stocks: KioskStockReplaceLine[];
};
