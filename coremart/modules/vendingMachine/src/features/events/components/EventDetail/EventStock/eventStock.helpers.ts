import { getLocalizedName } from '@/common/helpers';

import type { EventStockCatalogProduct } from './eventStock.types';


export function filterEventStockCatalogProducts(
	products: EventStockCatalogProduct[],
	query: string,
	lang: string,
): EventStockCatalogProduct[] {
	const q = query.trim().toLowerCase();
	if (!q) {
		return products;
	}
	return products.filter((p) => {
		if (p.sku.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q)) {
			return true;
		}
		if (getLocalizedName(p.name, lang).toLowerCase().includes(q)) {
			return true;
		}
		const n = p.name;
		return (n['en-US'] ?? '').toLowerCase().includes(q) || (n['vi-VN'] ?? '').toLowerCase().includes(q);
	});
}

export function catalogById(products: EventStockCatalogProduct[]): Map<string, EventStockCatalogProduct> {
	return new Map(products.map((p) => [p.id, p]));
}
