import { LocalizedName } from '../../common/helpers';


export type KioskProduct = {
	id: string,
	sku: string,
	barcode: string,
	imageUrl: string,
	name: LocalizedName,
	status: string,
	/**
	 * The catalogue price, absent when the product has no applicable price rule.
	 *
	 * Optional on purpose: "not priced" and "priced at zero" must stay distinguishable, or an
	 * unpriced product gets stocked for nothing. See BR §6.12.
	 */
	proposedPrice?: string,
	//
	etag: string,
	createdAt: string,
	org_id?: string,
	product_id?: string,
};
