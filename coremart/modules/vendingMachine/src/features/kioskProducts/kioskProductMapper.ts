import { KioskProduct } from './type';
import { LocalizedName } from '../../common/helpers';



/**
 * One row of the available-products response.
 *
 * The route returns *effective products* — a variant flattened together with its template — so
 * the display name, image and price are already resolved by Inventory. See BR §7.5: a consumer
 * must not re-derive which field comes from the template and which from the variant.
 */
type VariantSearchRow = {
	id?: string,
	variantId?: string,
	sku?: string,
	barcode?: string,
	primaryBarcode?: string,
	displayName?: string,
	name?: Record<string, string>,
	templateName?: Record<string, string>,
	price?: number | string | null,
	imageId?: string,
	imageUrl?: string,
	imageURL?: string,
	status?: string,
	createdAt?: string,
	etag?: string,
};

function normalizeLocalizedName(name: Record<string, string> | undefined): LocalizedName {
	const n = name ?? {};
	return {
		'en-US': n['en-US'] ?? n.en ?? '',
		'vi-VN': n['vi-VN'] ?? n.vi ?? '',
	};
}

/**
 * The display name is composed server-side from the template name plus the variant's attribute
 * values ("Classic T-Shirt / Black / M"), so it arrives as a plain string rather than a localized
 * map. Fall back to the template's localized name when a row predates that.
 */
function resolveName(row: VariantSearchRow): LocalizedName {
	if (row.displayName) {
		return { 'en-US': row.displayName, 'vi-VN': row.displayName };
	}
	return normalizeLocalizedName(row.templateName ?? row.name);
}

/**
 * The catalogue price, or `undefined` when the product has no applicable price rule.
 *
 * Absent must stay absent. A missing price previously defaulted to `'0'`, which the stock modals
 * then used to seed `sellPrice` — every unpriced product was silently stocked at 0 ₫. The caller
 * has to be able to tell "no price" from "free", so this never invents a number. See BR §6.12.
 */
function resolvePrice(price: number | string | null | undefined): string | undefined {
	if (price == null || price === '') {
		return undefined;
	}
	return String(price);
}

export function mapVariantRowToKioskProduct(row: VariantSearchRow): KioskProduct {
	const img = row.imageUrl ?? row.imageURL ?? row.imageId ?? '';
	return {
		id: row.variantId ?? row.id ?? '',
		sku: row.sku ?? '',
		barcode: row.primaryBarcode ?? row.barcode ?? '',
		imageUrl: img,
		name: resolveName(row),
		status: row.status ?? '',
		proposedPrice: resolvePrice(row.price),
		etag: row.etag ?? '',
		createdAt: row.createdAt ?? '',
	};
}
