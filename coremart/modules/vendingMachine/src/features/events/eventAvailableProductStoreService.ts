import * as request from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { buildSearchParams } from '../../common/helpers';
import { VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';
import { mapVariantRowToKioskProduct } from '../kioskProducts/kioskProductMapper';


import type { PagedSearchResponse, SearchParams } from '../../types';
import type { KioskProduct } from '../kioskProducts/type';


type VariantSearchRow = Parameters<typeof mapVariantRowToKioskProduct>[0];

type RawPage = {
	items: VariantSearchRow[],
	total: number,
	page: number,
	size: number,
};

export type SearchEventAvailableProductsRequest = {
	eventId: string,
} & SearchParams;

export const DEFAULT_EVENT_AVAILABLE_PAGE_SIZE = 5;


/**
 * Products that may still be added to an event.
 *
 * This is **not** a dynamic-model resource — the route returns product *variant* rows that are
 * mapped into `KioskProduct`, so there is no schema to drive `StoreCrudServiceBase`. It is a
 * plain `@storeService` over the existing REST call, which still gets a module-store slice and
 * `useServiceLayer`, but no automatic CRUD or events.
 */
@storeService('EventAvailableProductService', vendingMachineStore)
export class EventAvailableProductService {
	@storeAsyncMethod
	public async search(
		criteria: SearchEventAvailableProductsRequest,
	): Promise<PagedSearchResponse<KioskProduct>> {
		const { eventId, ...rest } = criteria;
		// Widen away the `SearchParams<T>` row type the rest-spread narrows to.
		const params: SearchParams = rest;
		const path = `v1/${VENDING_MACHINE_MODULE}/events/${encodeURIComponent(eventId)}/available-products`;
		const raw = await request.get<RawPage>(path, { searchParams: buildSearchParams(params) });
		const camel = snakeToCamelObject(raw) as RawPage;
		return {
			items: (camel.items ?? []).map(mapVariantRowToKioskProduct),
			total: camel.total,
			page: camel.page,
			size: camel.size,
		};
	}
}

export const eventAvailableProductService = new EventAvailableProductService();
