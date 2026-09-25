import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_STOCK_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type {
	BulkUpdateKioskStockItem,
	CreateKioskStockBody,
	KioskPositionUpdateItem,
	KioskStockReplaceRequest,
} from './types';
import type { RestCreateResponse } from '../../types';


const KIOSKS_PATH = `v1/${VENDING_MACHINE_MODULE}/kiosks`;

export type BulkCreateKioskStocksRequest = { kioskId: string, items: CreateKioskStockBody[] };
export type BulkUpdateKioskStocksRequest = { kioskId: string, items: BulkUpdateKioskStockItem[] };
export type ReplaceKioskStocksRequest = { kioskId: string, body: KioskStockReplaceRequest };
export type UpdateKioskPositionsRequest = { kioskId: string, positions: KioskPositionUpdateItem[] };


/**
 * CRUD over `vending_machine_kiosk_stock`, which is **nested** under a kiosk
 * (`v1/vending_machine/kiosks/:kioskId/kiosk-stocks`).
 *
 * Every call must pass the owning kiosk id as the trailing `primaryResourceId`:
 *
 * ```ts
 * dispatchMethod([{ page: 0, size: 20 }, kioskId]);   // search
 * dispatchMethod([{ id: stockId }, kioskId]);         // getById
 * ```
 *
 * The array form is not optional — `serviceSlice` dispatches a multi-argument call with its
 * params as an array. A single object would be read as the request alone, `primaryResourceId`
 * would be `undefined`, and `RestApi._getBasePath` throws `primaryResourceId is required`.
 *
 * `exists` cannot be used here: `RestApi.exists` takes no `primaryResourceId`.
 */
@storeService('KioskStockService', vendingMachineStore)
export class KioskStockService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_STOCK_SCHEMA_NAME });
	}

	/**
	 * The four operations below are **not** generic CRUD, so the dynamic-model REST surface
	 * cannot express them. They post to the nested routes directly and each takes the kiosk id
	 * inside its request object — note that is the *single-argument* convention, unlike the
	 * inherited methods above, which need the `[request, kioskId]` array form.
	 */

	/** `POST …/kiosks/:kioskId/kiosk-stocks/bulk`. */
	@storeAsyncMethod
	public async bulkCreate({ kioskId, items }: BulkCreateKioskStocksRequest): Promise<RestCreateResponse[]> {
		const path = `${KIOSKS_PATH}/${encodeURIComponent(kioskId)}/kiosk-stocks/bulk`;
		const result = await request.post<unknown>(path, { json: camelToSnakeObject(items) });
		return snakeToCamelObject(result) as RestCreateResponse[];
	}

	/** `PATCH …/kiosks/:kioskId/kiosk-stocks/bulk` — bulk sort_index / warning_quantity. */
	@storeAsyncMethod
	public async bulkUpdate({ kioskId, items }: BulkUpdateKioskStocksRequest): Promise<unknown> {
		const path = `${KIOSKS_PATH}/${encodeURIComponent(kioskId)}/kiosk-stocks/bulk`;
		const body = items.map((item) => camelToSnakeObject(item));
		return snakeToCamelObject(await request.patch<unknown>(path, { json: body }));
	}

	/** `PUT …/kiosks/:kioskId/kiosk-stocks/replace` — full shelf-layout replace. */
	@storeAsyncMethod
	public async replaceAll({ kioskId, body }: ReplaceKioskStocksRequest): Promise<unknown> {
		const path = `${KIOSKS_PATH}/${encodeURIComponent(kioskId)}/kiosk-stocks/replace`;
		return snakeToCamelObject(await request.put<unknown>(path, { json: camelToSnakeObject(body) }));
	}

	/** `PATCH …/kiosks/:kioskId/positions/upsert` — partial position updates. */
	@storeAsyncMethod
	public async upsertPositions({ kioskId, positions }: UpdateKioskPositionsRequest): Promise<unknown> {
		const path = `${KIOSKS_PATH}/${encodeURIComponent(kioskId)}/positions/upsert`;
		const body = positions.map((item) => camelToSnakeObject(item));
		return snakeToCamelObject(await request.patch<unknown>(path, { json: body }));
	}
}

export const kioskStockService = new KioskStockService();
