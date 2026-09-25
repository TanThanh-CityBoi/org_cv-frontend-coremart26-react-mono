import * as request from '@nikkierp/common/request';
import { snakeToCamelObject } from '@nikkierp/common/utils';

import { buildSearchParams } from '@/common/helpers';

import { mapVariantRowToKioskProduct } from './kioskProductMapper';
import { KioskProduct } from './type';

import type { PagedSearchResponse, SearchParams } from '@/types';


type VariantSearchRow = Parameters<typeof mapVariantRowToKioskProduct>[0];

export const kioskProductService = {
	async searchKioskProducts(
		orgId: string,
		params?: SearchParams,
	): Promise<PagedSearchResponse<KioskProduct>> {
		const raw = await request.get<{
			items: VariantSearchRow[];
			total: number;
			page: number;
			size: number;
		}>(`${orgId}/inventory/variants`, {
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
