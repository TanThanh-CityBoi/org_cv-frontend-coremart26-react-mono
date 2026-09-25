import { LocalizedName } from '@/common/helpers';
import { KioskProduct } from '@/features/kioskProducts/type';


const _simpleKioskStock = {
	createdAt: '2026-04-22T12:11:50Z',
	etag: '1776859910664867000',
	id: '01K1V9VM000000000000000033',
	isArchived: false,
	kioskRef: '01K1V9VM000000000000000024',
	product: {
		barcode: 'BAR000001',
		createdAt: '2026-04-22T12:22:50Z',
		etag: '1776860570039890000',
		id: '01JX0INVVR000010000000000A',
		imageUrl: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg',
		name: {
			en: 'Wireless Headphones - Black BT5.0',
			vi: 'Tai nghe không dây - ¿en BT5.0',
		},
		orgId: '01JWNY20G23KD4RV5VWYABQYHD',
		productId: '01JX0INVPD000010000000000A',
		proposedPrice: '90',
		sku: 'WH-BLACK-BT50',
		status: 'active',
	},
	positions: [
		{
			row: 'A',
			col: 0,
			isEnabled: true,
			quantity: 10,
			maxQuantity: 20,
			//
			id: '01K1V9VM000000000000000055',
			etag: '1776859910666594000',
			kioskRef: '01K1V9VM000000000000000024',
			stockRef: '01K1V9VM000000000000000033',
		},
	],
	productRef: '01JX0INVVR000010000000000A',
	scopeType: 'domain',
	sellPrice: '15000',
	sortIndex: 0,
};


/**
 * Aligns with CoreMart `vending_machine.kiosk_stock` / `kiosk_stock_position` REST JSON
 * (snake_case from API → camelCase after `snakeToCamelObject` in services).
 */

/** `vending_machine.kiosk_stock_position` */
export enum KioskStockRow {
	A = 'A',
	B = 'B',
	C = 'C',
	D = 'D',
	E = 'E',
	F = 'F',
	G = 'G',
	H = 'H',
	I = 'I',
	J = 'J',
	K = 'K',
	L = 'L',
	M = 'M',
	N = 'N',
	O = 'O',
	P = 'P',
	Q = 'Q',
	S = 'S',
	T = 'T',
}
type BuildRange<
	N extends number,
	Result extends number[] = [],
> = Result['length'] extends N
	? Result[number]
	: BuildRange<N, [...Result, Result['length']]>;

type Range<
	Min extends number,
	Max extends number,
> = Exclude<BuildRange<Max>, BuildRange<Min>>;

export type KioskStockCol = Range<1, 10>;

export type KioskStockPosition = {
	row: KioskStockRow;
	col: KioskStockCol;
	isEnabled: boolean;
	quantity: number;
	maxQuantity: number;
	//
	id?: string;
	etag?: string;
	kioskRef?: string;
	stockRef?: string;
};

/** `vending_machine.kiosk_stock` + optional product (search/get detail). */
export type KioskStock = {
	id: string;
	sortIndex?: number;
	sellPrice: string;
	warningQuantity?: number;
	kioskRef?: string;
	productRef?: string;
	product?: KioskProduct;
	positions: KioskStockPosition[];
	etag?: string;
};

/** UI / grid state alias (same payload as API `KioskStock`). */
export type KioskStockDetail = KioskStock;

export type CellStockItem = {
	// product
	stockId: string;
	productRef?: string;
	name?: LocalizedName;
	sku?: string;
	imageUrl?: string;
	// position
	row: KioskStockRow;
	col: KioskStockCol;
	isEnabled: boolean;
	quantity: number;
	maxQuantity: number;
};

/** In-memory grid: cell key (`${row}-${col}`) → cell payload. */
export type KioskStockGridMap = Map<string, CellStockItem | null>;
