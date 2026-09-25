/**
 * UI/catalog types for event stock (picker + table enrichment).
 * Not imported from kiosk.
 */

import { LocalizedName } from '@/common/helpers';


export type EventStockCatalogProduct = {
	id: string;
	sku: string;
	barcode: string;
	imageUrl: string;
	name: LocalizedName;
	status: string;
	proposedPrice: string;
	etag: string;
	createdAt: string;
};
