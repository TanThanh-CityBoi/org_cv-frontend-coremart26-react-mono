/**
 * Bruno: `Event - Available Products` → GET …/vending-machine/events/:id/available-products
 */
import * as request from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';

import { buildSearchParams } from '@/common/helpers';
import { mapVariantRowToKioskProduct } from '@/features/kioskProducts/kioskProductMapper';
import type { KioskProduct } from '@/features/kioskProducts/type';
import type { PagedSearchResponse, SearchParams } from '@/types';


import { BASE_PATH } from './eventService';


type VariantSearchRow = Parameters<typeof mapVariantRowToKioskProduct>[0];

export const eventAvailableProductService = {
	async searchEventAvailableProducts(
		eventId: string,
		params?: SearchParams,
	): Promise<PagedSearchResponse<KioskProduct>> {
		const raw = await request.get<{
			items: VariantSearchRow[];
			total: number;
			page: number;
			size: number;
		}>(`${BASE_PATH}/${eventId}/available-products`, {
			searchParams: buildSearchParams(params),
		});
		const camel = snakeToCamelObject(raw) as {
			items: VariantSearchRow[];
			total: number;
			page: number;
			size: number;
		};
		return {
			items: (camel.items ?? []).map(mapVariantRowToKioskProduct),
			total: camel.total,
			page: camel.page,
			size: camel.size,
		};
	},
};
