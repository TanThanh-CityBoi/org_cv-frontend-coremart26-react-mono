import { LocalizedName } from '@/common/helpers';

import { KioskProduct } from './type';


type VariantSearchRow = {
	id?: string;
	sku?: string;
	barcode?: string;
	name?: Record<string, string>;
	proposedPrice?: number | string;
	imageUrl?: string;
	imageURL?: string;
	status?: string;
	createdAt?: string;
	etag?: string;
};

function normalizeLocalizedName(name: Record<string, string> | undefined): LocalizedName {
	const n = name ?? {};
	return {
		'en-US': n['en-US'] ?? n.en ?? '',
		'vi-VN': n['vi-VN'] ?? n.vi ?? '',
	};
}

export function mapVariantRowToKioskProduct(row: VariantSearchRow): KioskProduct {
	const price = row.proposedPrice;
	const img = row.imageUrl ?? row.imageURL ?? '';
	return {
		id: row.id ?? '',
		sku: row.sku ?? '',
		barcode: row.barcode ?? '',
		imageUrl: img,
		name: normalizeLocalizedName(row.name),
		status: row.status ?? '',
		proposedPrice: price == null ? '0' : String(price),
		etag: row.etag ?? '',
		createdAt: row.createdAt ?? '',
	};
}
