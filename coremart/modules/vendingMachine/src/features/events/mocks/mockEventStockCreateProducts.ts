import type { EventStockCatalogProduct } from '../components/EventDetail/EventStock/eventStock.types';

/** Mock catalog for create event stock UI (replace with product search later). */
export const MOCK_EVENT_STOCK_CREATE_PRODUCTS: EventStockCatalogProduct[] = [
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
];
