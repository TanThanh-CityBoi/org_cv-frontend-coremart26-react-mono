import type { KioskProduct } from '@/features/kioskProducts/type';

/**
 * Mock catalog for Create kiosk stock (replace with product search later).
 * Variant rows align with `0005002_inventory_seeds.sql` → `inventory_variants` INSERT
 * (ids, sku, localized `name`, `proposed_price`, null barcode / image as in DB).
 */
export const MOCK_KIOSK_STOCK_CREATE_PRODUCTS: KioskProduct[] = [
	{
		id: '01K5INV0000000000000000500',
		sku: 'INV-SEED-ED-BERRY-01',
		barcode: '',
		imageUrl: '',
		name: { 'en-US': 'Berry', 'vi-VN': 'Dâu' },
		status: 'active',
		proposedPrice: '15000',
		etag: 'seed-etag-500',
		createdAt: '2026-01-15T00:00:00Z',
	},
	{
		id: '01K5INV0000000000000000510',
		sku: 'INV-SEED-ED-BERRY',
		barcode: '',
		imageUrl: '',
		name: { 'en-US': 'Berry', 'vi-VN': 'Dâu' },
		status: 'active',
		proposedPrice: '15000',
		etag: 'seed-etag-050',
		createdAt: '2026-01-15T00:00:00Z',
	},
	{
		id: '01K5INV0000000000000000520',
		sku: 'INV-SEED-ED-CITRUS',
		barcode: '',
		imageUrl: '',
		name: { 'en-US': 'Citrus', 'vi-VN': 'Cam chanh' },
		status: 'active',
		proposedPrice: '15000',
		etag: 'seed-etag-051',
		createdAt: '2026-01-15T00:00:00Z',
	},
	{
		id: '01K5INV0000000000000000530',
		sku: 'INV-SEED-WATER-500',
		barcode: '',
		imageUrl: '',
		name: { 'en-US': '500 ml bottle', 'vi-VN': 'Chai 500 ml' },
		status: 'active',
		proposedPrice: '5000',
		etag: 'seed-etag-052',
		createdAt: '2026-01-15T00:00:00Z',
	},
	// {
	// 	id: '01K5INV0000000000000000540',
	// 	sku: 'INV-SEED-CHIPS-ORG',
	// 	barcode: '',
	// 	imageUrl: '',
	// 	name: { 'en-US': 'Original 90g', 'vi-VN': 'Tự nhiên 90g' },
	// 	status: 'active',
	// 	proposedPrice: '12000',
	// 	etag: 'seed-etag-053',
	// 	createdAt: '2026-01-15T00:00:00Z',
	// },
];
