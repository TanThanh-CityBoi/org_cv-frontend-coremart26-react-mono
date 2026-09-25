import type {
	CellStockItem,
	KioskStock,
	KioskStockCol,
	KioskStockGridMap,
	KioskStockPosition,
	KioskStockRow,
} from './kioskStock.types';
import type { KioskPositionUpdateItem } from '@/features/kiosks/kioskService';



// kiosk positions: [PUT] /kiosks/:kioskId/positions
// [
//   {
//     row: 'A',
//     col: 1,
//     stock_ref: null,
//   },
//   {
//     row: 'B',
//     col: 2,
//     stock_ref: '------',
//     quantity: 5,
//     max_quantity: 20,
//     is_enabled: true,
//   }
// ]

// kiosk stocks: [PUT] /kiosks/:kioskId/stocks
// [
//   {
//     id: 'uuid',
//     sell_price: 100,
//     sort_index: 1,
//   }
// ]



export const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const getCellKey = (row: string, col: string | number): string => `${row}-${col}`;

/** Parse `getCellKey` output into row and numeric column. */
export function parseCellKey(cellKey: string /** 'row-col' */): { row: string | null; col: number | null } {
	const [row, col] = cellKey.split('-');
	if (!row || !col || Number.isNaN(Number(col))) {
		return { row: null, col: null };
	}
	return { row: row as KioskStockRow, col: Number(col) };
}

const clearedPosition = (row: string, col: number): Pick<KioskPositionUpdateItem, 'row' | 'col' | 'stockRef'> => ({
	row,
	col,
	stockRef: null,
});


// `kioskStocks` → `Map<productRef, KioskStock>`
export const computeKioskStockToGrid = (kioskStocks: KioskStock[]): KioskStockGridMap => {
	const kioskStockGrid: KioskStockGridMap = new Map();

	kioskStocks.forEach((stock) => {
		stock?.positions?.forEach((pos) => {
			const key = getCellKey(pos.row, pos.col);
			const product = stock?.product;
			kioskStockGrid.set(key, {
				stockId: stock?.id,
				productRef: product?.id,
				name: product?.name,
				sku: product?.sku,
				imageUrl: product?.imageUrl,
				row: pos.row,
				col: pos.col,
				isEnabled: pos.isEnabled,
				quantity: Number(pos.quantity) || 0,
				maxQuantity: Number(pos.maxQuantity) || 0,
			});
		});
	});

	return kioskStockGrid;
};

/** Build a grid cell from a kiosk stock line + slot + position quantities. */
export function buildCellItemFromKioskStock(
	stock: KioskStock,
	row: string,
	col: string,
	quantity: number,
	maxQuantity: number,
): CellStockItem {
	const product = stock.product;
	return {
		stockId: stock.id,
		productRef: product?.id ?? stock.productRef,
		name: product?.name,
		sku: product?.sku,
		imageUrl: product?.imageUrl,
		row: row as KioskStockRow,
		col: Number(col) as KioskStockCol,
		isEnabled: true,
		quantity: Math.max(0, Math.min(quantity, maxQuantity)),
		maxQuantity: Math.max(0, maxQuantity),
	};
}


/**
 * Build [PUT] …/positions body from touch keys and current grid. Deleted cells are absent in `grid`
 * → only row/col, other fields null.
 */
export function computeUpdatePosition(
	cellKeys: readonly string[],
	grid: KioskStockGridMap,
): KioskPositionUpdateItem[] {
	const updatePositions: KioskPositionUpdateItem[] = [];

	cellKeys.forEach((key) => {
		const cell = grid.get(key);
		if (!cell?.productRef) {
			const { row, col } = parseCellKey(key);
			if (!row || !col) return;
			updatePositions.push(clearedPosition(row, col));
			return;
		}

		updatePositions.push({
			row: cell.row,
			col: cell.col,
			stockRef: cell.stockId,
			quantity: Number(cell.quantity) || 0,
			maxQuantity: Number(cell.maxQuantity) || 0,
			isEnabled: cell.isEnabled,
		});
	});
	return updatePositions;
}



// !- @deprecated - //

/** @deprecated */
export type KioskStockListMap = Map<string, KioskStock | null>;
export const computeKioskStockListToMap = (kioskStocks: KioskStock[]): KioskStockListMap => {
	return new Map(
		kioskStocks.filter((s) => s.productRef).map((s) => [s.productRef as string, s]),
	);
};

/** @deprecated Use `computeUpdatePosition` instead. */
type UpdatePosition = Pick<KioskStockPosition, 'row' | 'col' | 'quantity' | 'maxQuantity'> & { status: 'enable' | 'disable' };
type UpdateStockPayload = {
	productRef: string;
	sortIndex: number;
	sellPrice: string;
	positions: UpdatePosition[];
}[];
export function computeGridToUpdateStocks(grid: KioskStockGridMap, stockList: KioskStockListMap): UpdateStockPayload {
	const gridCellbyProduct = new Map<string, CellStockItem[]>();
	grid.forEach((cell: CellStockItem | null) => {
		if (!cell?.productRef) return;
		const list = gridCellbyProduct.get(cell.productRef) ?? [];
		list.push(cell);
		gridCellbyProduct.set(cell.productRef, list);
	});

	let sortIdx = 0;
	const out: UpdateStockPayload = [];

	for (const [productRef, cells] of gridCellbyProduct) {
		const stock = stockList.get(productRef);

		const sorted = [...cells].sort((a, b) => {
			const rowCmp = String(a.row).localeCompare(String(b.row));
			if (rowCmp !== 0) return rowCmp;
			return Number(a.col) - Number(b.col);
		});
		const positions: UpdatePosition[] = sorted.map((c) => ({
			row: c.row,
			col: c.col,
			status: c.isEnabled ? 'enable' : 'disable',
			quantity: Number(c.quantity) || 0,
			maxQuantity: Number(c.maxQuantity) || 0,
		}));

		out.push({
			productRef,
			sortIndex: stock?.sortIndex ?? sortIdx,
			sellPrice: stock?.sellPrice ?? '0',
			positions,
		});
		sortIdx += 1;
	}
	return out;
}


/** Total quantity across all slots for one kiosk stock line. */
export function totalQuantityForKioskStock(stock: KioskStock): number {
	if (!stock.positions?.length) {
		return 0;
	}
	return stock.positions.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
}

/** Human-readable `A:0, B:1` for kiosk stock positions. */
export function formatKioskStockPositionsDisplay(stock: KioskStock): string {
	if (!stock.positions?.length) {
		return '—';
	}
	return stock.positions.map((p) => `${p.row}:${p.col}`).join(', ');
}
