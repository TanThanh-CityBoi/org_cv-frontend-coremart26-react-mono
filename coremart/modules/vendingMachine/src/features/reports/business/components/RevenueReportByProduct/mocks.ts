/** Demo SKU-level revenue (top 15 by revenue shown in chart). */
export const MOCK_PRODUCT_REVENUE = [
	{ productLabel: 'Aquafina 500ml', revenue: 980_000 },
	{ productLabel: 'Coca-Cola 330ml', revenue: 920_000 },
	{ productLabel: 'Pepsi 390ml', revenue: 860_000 },
	{ productLabel: 'Trà Xanh C2', revenue: 780_000 },
	{ productLabel: 'Number 1 Active', revenue: 720_000 },
	{ productLabel: 'Sting dâu', revenue: 690_000 },
	{ productLabel: 'Red Bull 250ml', revenue: 650_000 },
	{ productLabel: 'TH True Milk 180ml', revenue: 610_000 },
	{ productLabel: 'Lốc Lon Bia Tiger', revenue: 580_000 },
	{ productLabel: 'Snack Orion', revenue: 520_000 },
	{ productLabel: 'Mì Kokomi 90gr', revenue: 480_000 },
	{ productLabel: 'Nước Lavie', revenue: 450_000 },
	{ productLabel: 'Trà Ô Long Tea+', revenue: 420_000 },
	{ productLabel: 'Kem Celano', revenue: 390_000 },
	{ productLabel: 'Bánh Goute', revenue: 360_000 },
	{ productLabel: '7Up 320ml', revenue: 320_000 },
	{ productLabel: 'Mirinda cam', revenue: 280_000 },
	{ productLabel: 'Nescafé lon', revenue: 240_000 },
	{ productLabel: 'Bánh Solite', revenue: 195_000 },
	{ productLabel: 'Nước suối Number1 500ml', revenue: 160_000 },
] as const;

/** Demo category breakdown for revenue by product until APIs are wired. */
export const MOCK_CATEGORY_BREAKDOWN = [
	{ categoryId: 'c1', categoryLabel: 'Nước Ngọt', revenue: 980000, quantity: 210 },
	{ categoryId: 'c2', categoryLabel: 'Nước tinh khiết', revenue: 760000, quantity: 320 },
	{ categoryId: 'c3', categoryLabel: 'Trà', revenue: 620000, quantity: 180 },
	{ categoryId: 'c4', categoryLabel: 'Sữa', revenue: 510000, quantity: 95 },
	{ categoryId: 'c5', categoryLabel: 'unknown', revenue: 120000, quantity: 40 },
	{ categoryId: 'c6', categoryLabel: 'Cà Phê', revenue: 430000, quantity: 120 },
	{ categoryId: 'c7', categoryLabel: 'Đồ ăn', revenue: 290000, quantity: 55 },
];
