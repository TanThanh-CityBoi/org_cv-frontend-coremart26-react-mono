import { LocalizedName } from '@/common/helpers';


export type KioskProduct = {
	id: string,
	sku: string,
	barcode: string;
	imageUrl: string,
	name: LocalizedName,
	status: string,
	proposedPrice: string,
	//
	etag: string,
	createdAt: string,
	org_id?: string,
	product_id?: string,
};
