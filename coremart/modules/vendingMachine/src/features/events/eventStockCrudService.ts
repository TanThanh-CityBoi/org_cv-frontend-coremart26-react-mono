import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_EVENT_STOCK_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type { RestCreateResponse } from '../../types';


export type BulkCreateEventStockItem = {
	productRef: string,
	sellPrice: string,
};

export type BulkCreateEventStocksRequest = {
	eventId: string,
	items: BulkCreateEventStockItem[],
};

/**
 * CRUD over `vending_machine_kiosk_event_stock`.
 *
 * Nested under its event: the backend serves `/v1/vending_machine/events/:event_id/event-stocks`
 * (`transport/restful/index.go`), so every operation needs the owning event id as its
 * `primaryResourceId`. The schema is registered with a matching `primaryResourcePath` in
 * `src/index.tsx`.
 */
@storeService('EventStockService', vendingMachineStore)
export class EventStockService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_EVENT_STOCK_SCHEMA_NAME });
	}

	/**
	 * Adds several product lines to an event in one call.
	 *
	 * The dynamic-model REST surface has no bulk verb, so this posts straight to the nested
	 * bulk route the legacy service used. Assumed to exist per the module's convention that
	 * not-yet-surfaced endpoints are wired ahead of the UI that consumes them.
	 */
	@storeAsyncMethod
	public async bulkCreate({ eventId, items }: BulkCreateEventStocksRequest): Promise<RestCreateResponse[]> {
		const path = `v1/${VENDING_MACHINE_MODULE}/events/${encodeURIComponent(eventId)}/event-stocks/bulk`;
		const result = await request.post<unknown>(path, { json: items.map((item) => camelToSnakeObject(item)) });
		return snakeToCamelObject(result) as RestCreateResponse[];
	}
}

export const eventStockCrudService = new EventStockService();
