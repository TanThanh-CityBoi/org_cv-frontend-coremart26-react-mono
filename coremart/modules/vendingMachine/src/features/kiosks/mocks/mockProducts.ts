import { LocalizedName } from '@/common/helpers';
import { KioskProduct } from '@/features/kioskProducts/type';

import {
	KioskStockRow,
	type KioskStockPosition,
} from '../components/KioskDetail/KioskStockGrid/kioskStock.types';


export interface ProductPosition {
	row: string;
	col: number;
	quantity: number;
	maxQuantity: number;
}

export interface Product {
	id: string;
	code: string;
	name: string;
	image?: string;
	price: number;
	positions: ProductPosition[];
	totalQuantity: number;
}

const MOCK_PRODUCT_ETAG = '0';
const MOCK_PRODUCT_CREATED_AT = '2026-01-01T00:00:00Z';

const VALID_KIOSK_STOCK_ROW = new Set<string>(Object.values(KioskStockRow));

/** Build `LocalizedName` for mocks (same label in every locale). */
export function localizedNameFromLabel(label: string): LocalizedName {
	return {
		'en-US': label,
		'vi-VN': label,
	};
}

/** Map UI / mock row letter to `KioskStockRow` (falls back to `A`). */
export function parseKioskStockRow(letter: string): KioskStockRow {
	const key = letter.trim().toUpperCase();
	return VALID_KIOSK_STOCK_ROW.has(key) ? (key as KioskStockRow) : KioskStockRow.A;
}

/** Clamp column to API grid `1..9` (`KioskStockPosition.col`). */
export function clampKioskStockCol(col: number): KioskStockPosition['col'] {
	const n = Math.floor(Number(col));
	if (n >= 1 && n <= 10) return n as KioskStockPosition['col'];
	return 1 as KioskStockPosition['col'];
}

/** `Product` → nested `KioskStockProduct` (catalog include shape). */
export function productToKioskStockProduct(product: Product): KioskProduct {
	return {
		id: product.id,
		sku: product.code,
		barcode: product.code,
		imageUrl: product.image ?? '',
		name: localizedNameFromLabel(product.name),
		status: 'active',
		proposedPrice: String(product.price),
		etag: MOCK_PRODUCT_ETAG,
		createdAt: MOCK_PRODUCT_CREATED_AT,
	};
}

/** `ProductPosition[]` → `KioskStockPosition[]` (row letter + col). */
export function productPositionsToKioskStockPositions(
	positions: ProductPosition[],
): KioskStockPosition[] {
	return positions.map((pos) => ({
		row: parseKioskStockRow(pos.row),
		col: clampKioskStockCol(pos.col),
		quantity: pos.quantity,
		maxQuantity: pos.maxQuantity,
		isEnabled: true,
	}));
}

/** Backend-shaped kiosk stock builders (see `KioskStock/mockKioskStock.ts`). */
export {
	buildMockKioskStocksFromProducts,
	generateMockStockGrid,
} from '../components/KioskDetail/KioskStockGrid/mockKioskStock';

export const MOCK_PRODUCTS: Product[] = [
	{
		id: 'mock-1',
		code: 'PROD-001',
		name: 'Nước ngọt cola 330ml',
		image: 'https://console.api.coremart.vn/gallery/images/d659aab0-f2ad-11f0-aab4-ed8e48998ffb--coca-cola-lon.png',
		price: 15000,
		totalQuantity: 20,
		positions: [
			{ row: 'A', col: 1, quantity: 4, maxQuantity: 5 },
			{ row: 'A', col: 2, quantity: 5, maxQuantity: 5 },
			{ row: 'A', col: 3, quantity: 4, maxQuantity: 5 },
			{ row: 'A', col: 4, quantity: 3, maxQuantity: 5 },
			{ row: 'A', col: 5, quantity: 2, maxQuantity: 5 },
		],
	},
	{
		id: 'mock-2',
		code: 'PROD-002',
		name: 'Nước suối 500ml',
		image: 'https://console.api.coremart.vn/gallery/images/0d1f58d0-2439-11f1-aab4-ed8e48998ffb--AQUAFINA.png',
		price: 20000,
		totalQuantity: 15,
		positions: [
			{ row: 'B', col: 1, quantity: 4, maxQuantity: 5 },
			{ row: 'B', col: 2, quantity: 5, maxQuantity: 5 },
			{ row: 'B', col: 3, quantity: 4, maxQuantity: 5 },
			{ row: 'B', col: 4, quantity: 1, maxQuantity: 5 },
			{ row: 'B', col: 5, quantity: 1, maxQuantity: 5 },
		],
	},
	{
		id: 'mock-3',
		code: 'PROD-003',
		name: 'Trà ô long 500ml',
		image: 'https://console.api.coremart.vn/gallery/images/ef236bc0-ceaf-11f0-9e41-6123d1353270--tra-o-long-tea-plus-320ml.png',
		price: 18000,
		totalQuantity: 18,
		positions: [
			{ row: 'C', col: 1, quantity: 3, maxQuantity: 5 },
			{ row: 'C', col: 2, quantity: 5, maxQuantity: 5 },
			{ row: 'C', col: 3, quantity: 4, maxQuantity: 5 },
			{ row: 'C', col: 4, quantity: 3, maxQuantity: 5 },
			{ row: 'C', col: 5, quantity: 3, maxQuantity: 5 },
		],
	},
];
