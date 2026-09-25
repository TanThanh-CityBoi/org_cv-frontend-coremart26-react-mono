import * as request from '@nikkierp/common/request';
import { unwrapResult } from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { mapVariantRowToKioskProduct } from './kioskProductMapper';
import { buildSearchParams } from '../../common/helpers';
import { VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


import type { KioskProduct } from './type';
import type { PagedSearchResponse, SearchParams } from '../../types';


const BASE_PATH = `v1/${VENDING_MACHINE_MODULE}/kiosks`;

type VariantSearchRow = Parameters<typeof mapVariantRowToKioskProduct>[0];

type RawPage = {
	items: VariantSearchRow[],
	total: number,
	page: number,
	size: number,
};

export type SearchKioskAvailableProductsRequest = {
	kioskId: string,
} & SearchParams;

function toKioskProductPage(raw: RawPage): PagedSearchResponse<KioskProduct> {
	const camel = snakeToCamelObject(raw) as RawPage;
	return {
		items: (camel.items ?? []).map(mapVariantRowToKioskProduct),
		total: camel.total,
		page: camel.page,
		size: camel.size,
	};
}


/**
 * Products that may still be added to a kiosk.
 *
 * The kiosk twin of `EventAvailableProductService`, and plain for the same reason: the route
 * returns product *variant* rows mapped into `KioskProduct`, so there is no dynamic-model schema
 * to drive `StoreCrudServiceBase`.
 */
@storeService('KioskAvailableProductService', vendingMachineStore)
export class KioskAvailableProductService {
	@storeAsyncMethod
	public async search(
		criteria: SearchKioskAvailableProductsRequest,
	): Promise<PagedSearchResponse<KioskProduct>> {
		const { kioskId, ...rest } = criteria;
		// Widen away the `SearchParams<T>` row type the rest-spread narrows to.
		const params: SearchParams = rest;
		const path = `${BASE_PATH}/${encodeURIComponent(kioskId)}/available-products`;
		const raw = await request.get<RawPage>(path, { searchParams: buildSearchParams(params) });
		return toKioskProductPage(unwrapResult(raw));
	}
}

export const kioskAvailableProductStoreService = new KioskAvailableProductService();
