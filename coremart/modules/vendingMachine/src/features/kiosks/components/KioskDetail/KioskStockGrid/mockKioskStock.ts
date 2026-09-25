import {
	MOCK_PRODUCTS,
	productPositionsToKioskStockPositions,
	productToKioskStockProduct,
	clampKioskStockCol,
	parseKioskStockRow,
} from '@/features/kiosks/mocks/mockProducts';

import type { KioskStock, KioskStockPosition } from './kioskStock.types';



const mockStockId = (productId: string, index: number) => `mock-kiosk-stock-${productId}-${index}`;

/** Build backend-shaped kiosk stock list from shared product mocks (`MOCK_PRODUCTS`). */
export function buildMockKioskStocksFromProducts(kioskId: string): KioskStock[] {
	return MOCK_PRODUCTS.map((product, i) => ({
		id: mockStockId(product.id, i),
		kioskRef: kioskId,
		productRef: product.id,
		sellPrice: String(product.price),
		sortIndex: i,
		positions: productPositionsToKioskStockPositions(product.positions),
		product: productToKioskStockProduct(product),
	}));
}

/**
 * Dense grid mock: fills row×col cells with cycling `MOCK_PRODUCTS` (API field shapes).
 * Columns are `1..9` to match `KioskStockPosition.col`.
 */
export function generateMockStockGrid(kioskId: string, rowNumber: number = 10): KioskStock[] {
	const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, rowNumber);
	const cols = Array.from({ length: 10 }, (_, i) => i + 1);
	const stocks: KioskStock[] = [];

	rowLetters.forEach((rowLetter, rowIdx) => {
		const rowKey = parseKioskStockRow(rowLetter);
		cols.forEach((col) => {
			const cellIndex = rowIdx * cols.length + col - 1;
			const product = MOCK_PRODUCTS[cellIndex % MOCK_PRODUCTS.length];
			const maxQty = 5;
			const quantity = (cellIndex % maxQty) + 1;

			let stock = stocks.find((s) => s.productRef === product.id);
			if (!stock) {
				stock = {
					id: mockStockId(product.id, stocks.length),
					kioskRef: kioskId,
					productRef: product.id,
					sellPrice: String(product.price),
					sortIndex: stocks.length,
					positions: [],
					product: productToKioskStockProduct(product),
				};
				stocks.push(stock);
			}
			const pos: KioskStockPosition = {
				row: rowKey,
				col: clampKioskStockCol(col),
				quantity,
				maxQuantity: maxQty,
				isEnabled: true,
			};
			stock.positions.push(pos);
		});
	});

	return stocks;
}
