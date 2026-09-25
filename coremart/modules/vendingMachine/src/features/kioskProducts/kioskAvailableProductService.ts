import * as request from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';

import { buildSearchParams } from '@/common/helpers';

import { mapVariantRowToKioskProduct } from './kioskProductMapper';
import { KioskProduct } from './type';

import type { PagedSearchResponse, SearchParams } from '@/types';


const BASE_PATH = 'vending-machine/kiosks';

type VariantSearchRow = Parameters<typeof mapVariantRowToKioskProduct>[0];

export const kioskAvailableProductService = {
	async searchKioskAvailableProducts(
		kioskId: string,
		params?: SearchParams,
	): Promise<PagedSearchResponse<KioskProduct>> {
		const raw = await request.get<{
			items: VariantSearchRow[];
			total: number;
			page: number;
			size: number;
		}>(`${BASE_PATH}/${kioskId}/available-products`, {
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
