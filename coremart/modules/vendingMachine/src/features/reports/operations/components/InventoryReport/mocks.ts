import type { InventorySourceRow } from './type';

/** Placeholder kiosks — replace when inventory API is wired. */
export const MOCK_INVENTORY_KIOSKS = [
	{ id: 'mock-kiosk-1', name: 'cv_test' },
	{ id: 'mock-kiosk-2', name: 'Bảo tàng Mỹ thuật TP.HCM' },
	{ id: 'mock-kiosk-3', name: 'Saigon Garden Mall' },
] as const;

const CATEGORY_KEYS = [
	'softDrink',
	'purifiedWater',
	'tea',
	'milk',
	'coffee',
	'beer',
	'coconut',
	'food',
	'unknown',
	'organic',
] as const;

const PRODUCT_NAMES: string[] = [
	'Revive',
	'Aquafina 500ml',
	'Revive chanh muối',
	'Trà Xanh C2',
	'Coca Cola',
	'Pepsi',
	'Sting dâu',
	'7 Up',
	'Sprite',
	'Fanta cam',
	'Nước suối Lavie',
	'TH True Milk',
	'Nutrifood Vị Dâu',
	'Cà phê sữa đá hộp',
	'Bia Tiger',
	'Nước dừa tươi',
	'Mì ly Hảo Hảo',
	'Bánh Oreo',
	'Trà ô long Tea+',
	'Number 1',
	'Red Bull',
	'Monster',
	'Nước khoáng Thạch Bích',
	'Vinamilk có đường',
	'Milo lon',
	'Trà Cozy chanh',
	'Wake-up 247',
	'Highlands canned',
	'Bia Heineken',
	'C2 vị đào',
	'Trà xanh không độ',
	'Revive chanh',
	'Schweppes',
	'Mirinda xá xị',
	'Aquafina 1.5l',
	'Lavabeer 0%',
	'Không độ chai nhỏ',
	'Trà sen vàng',
	'Đào sả',
	'Cà phê đen đá',
	'Snack Swing',
	'Khô gà bơ tỏi',
	'Bánh gạo One One',
	'Sữa chua uống Yakult',
	'Nước ép cam',
	'Trà sữa lon',
	'Khác',
	'Trà organic',
];

function pick<T>(arr: readonly T[], i: number): T {
	return arr[i % arr.length]!;
}

/** Demo stock rows until inventory API is available. */
export const MOCK_INVENTORY_ROWS: InventorySourceRow[] = PRODUCT_NAMES.map((productName, i) => {
	const kiosk = pick(MOCK_INVENTORY_KIOSKS, i);
	const catIdx = i % CATEGORY_KEYS.length;
	const categoryKey = CATEGORY_KEYS[catIdx]!;
	const base = 20 + (i * 17) % 140;
	const max = base + 40 + (i * 11) % 120;
	const warning = Math.max(0, Math.floor(base * 0.15) - (i % 5));
	const selling = Math.min(base, base - (i % 7));
	return {
		productId: `inv-prod-${1000 + i}`,
		productName,
		categoryKey,
		kioskId: kiosk.id,
		kioskName: kiosk.name,
		totalQty: base,
		sellingQty: selling,
		warningQty: warning,
		maxQty: max,
	};
});
