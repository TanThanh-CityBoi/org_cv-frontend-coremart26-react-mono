import { LocalizedName } from '@/common/helpers';


export type InventoryReportAppliedFilters = {
	kioskIds: string[] | null;
	/** Substring match on demo kiosk name until inventory API is wired */
	kioskLabel: string | null;
};

export type InventorySourceRow = {
	productId: string;
	productName: string;
	categoryKey: string;
	kioskId: string;
	kioskName: string;
	totalQty: number;
	sellingQty: number;
	warningQty: number;
	maxQty: number;
};


export type InventoryTableColumnKey =
	| 'productName'
	| 'totalQty'
	| 'sellingQty'
	| 'warningQty'
	| 'maxQty';



// "product_id": "01K5INV0000000000000000500",
// "name": {
//   "en-US": "Berry",
//   "vi-VN": "Dâu"
// },
// "remaining_quantity": 100,
// "capacity_quantity": 250,
// "active_remaining_quantity": 80

export type ProductInventoryReport = {
	productId: string;
	sku: string;
	barcode?: string;
	name: LocalizedName;
	imageUrl?: string | null;
	warningQuantity: number;
	remainingQuantity: number;
	capacityQuantity: number;
	activeRemainingQuantity: number;
};