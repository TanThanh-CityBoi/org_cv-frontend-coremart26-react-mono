/** Mock P&L dashboard series (12 months ending May '26). Replace with API when available. */

import type {
	PnlDashboardKpi,
	PnlExpenseSlice,
	PnlOperatingMonthRow,
	PnlProfitTrendMonthRow,
	PnlStackedMonthRow,
	PnlStatementTableRow,
} from './type';


export const PNL_DASH_MONTHS = [
	"Jun '25",
	"Jul '25",
	"Aug '25",
	"Sep '25",
	"Oct '25",
	"Nov '25",
	"Dec '25",
	"Jan '26",
	"Feb '26",
	"Mar '26",
	"Apr '26",
	"May '26",
] as const;

export const MOCK_PNL_KPI: PnlDashboardKpi = {
	totalRevenue: 2_600_000_000,
	totalGrossProfit: 2_000_000_000,
	returnOnAssetsPct: 29,
	totalOperatingProfit: 531_900_000,
	returnOnEquityPct: 211,
	totalNetProfit: 488_400_000,
};

const opCurve = (): PnlOperatingMonthRow[] =>
	PNL_DASH_MONTHS.map((month, i) => {
		const base = 120 + i * 9 + (i > 9 ? -55 : i > 7 ? 12 : 0);
		const rev = Math.round(base * 1_000_000 + (i === 11 ? -40_000_000 : 0));
		const exp = Math.round(rev * 0.72 + 8_000_000 * Math.sin(i * 0.4));
		const marginPct = rev > 0 ? Math.round(((rev - exp) / rev) * 1000) / 10 : 0;
		return { month, revenue: rev, expenses: exp, operatingMarginPct: marginPct };
	});

export const MOCK_PNL_OPERATING_12M: PnlOperatingMonthRow[] = opCurve();

export const MOCK_PNL_PROFIT_TRENDS: PnlProfitTrendMonthRow[] = MOCK_PNL_OPERATING_12M.map((row, i) => {
	const rev = row.revenue;
	const gp = Math.round(rev * 0.33);
	const op = Math.round(rev * 0.11);
	const np = Math.round(rev * 0.09);
	const gmp = Math.round((gp / rev) * 1000) / 10;
	const omp = Math.round((op / rev) * 1000) / 10;
	const nmp = Math.round((np / rev) * 1000) / 10;
	return {
		month: row.month,
		grossProfit: gp,
		grossMarginPct: i === 11 ? gmp - 18 : gmp,
		operatingProfit: op,
		operatingMarginPct: i === 11 ? omp - 25 : omp,
		netProfit: np,
		netMarginPct: i === 11 ? nmp - 22 : nmp,
	};
});

const donutPalette = (): PnlExpenseSlice[] => [
	{ key: 'rent', value: 28 },
	{ key: 'electricity', value: 14 },
	{ key: 'gatewayFees', value: 22 },
	{ key: 'waste', value: 8 },
	{ key: 'marketing', value: 12 },
	{ key: 'payrollTax', value: 10 },
	{ key: 'otherExpense', value: 6 },
];

export const MOCK_PNL_EXPENSE_DONUT_TODAY: PnlExpenseSlice[] = donutPalette().map((s, i) => ({
	...s,
	value: s.value + (i % 3) - (i === 4 ? 2 : 0),
}));

export const MOCK_PNL_EXPENSE_DONUT_LAST_MONTH: PnlExpenseSlice[] = donutPalette().map((s, i) => ({
	...s,
	value: Math.max(3, s.value + (i % 5) - (i === 1 ? 3 : i === 2 ? -2 : 0)),
}));

export const MOCK_REVENUE_STACKED_12M: PnlStackedMonthRow[] = MOCK_PNL_OPERATING_12M.map((row) => ({
	month: row.month,
	directCosts: Math.round(row.revenue * 0.62),
	grossProfit: Math.round(row.revenue * 0.38),
}));

export const MOCK_EXPENSE_BY_TYPE_12M: PnlStackedMonthRow[] = MOCK_PNL_OPERATING_12M.map((row) => ({
	month: row.month,
	operatingExpense: Math.round(row.expenses * 0.82),
	directCosts: Math.round(row.expenses * 0.18),
}));

export const MOCK_REVENUE_BY_ACCOUNT_12M: PnlStackedMonthRow[] = MOCK_PNL_OPERATING_12M.map((row) => ({
	month: row.month,
	salesChannel: Math.round(row.revenue * 0.78),
	serviceChannel: Math.round(row.revenue * 0.22),
}));

export const MOCK_EXPENSE_BY_ACCOUNT_12M: PnlStackedMonthRow[] = MOCK_PNL_OPERATING_12M.map((row) => ({
	month: row.month,
	rentPremises: Math.round(row.expenses * 0.26),
	utilsAndOps: Math.round(row.expenses * 0.12),
	gatewayAndBank: Math.round(row.expenses * 0.2),
	partnersDiscount: Math.round(row.expenses * 0.11),
	expiredGoods: Math.round(row.expenses * 0.07),
	adminHr: Math.round(row.expenses * 0.15),
	miscExpense: Math.round(row.expenses * 0.09),
}));

export const MOCK_PNL_STATEMENT_TABLE: PnlStatementTableRow[] = [
	{ accountKey: 'rowRevenue', mtd: 66_464_000, lastMonth: 216_712_000, ytd: 1_231_738_000, emphasis: true },
	{ accountKey: 'rowDirectCosts', mtd: 0, lastMonth: -83_102_000, ytd: -333_630_000 },
	{ accountKey: 'rowGrossProfit', mtd: 66_464_000, lastMonth: 133_610_000, ytd: 898_108_000, emphasis: true },
	{ accountKey: 'rowExpenseLine', mtd: -60_735_000, lastMonth: -123_105_000, ytd: -598_218_000 },
	{ accountKey: 'rowOperatingProfit', mtd: 5_729_000, lastMonth: 10_505_000, ytd: 299_890_000, emphasis: true },
	{ accountKey: 'rowOtherIncome', mtd: 0, lastMonth: 4_536_000, ytd: 88_487_000 },
	{ accountKey: 'rowDepreciation', mtd: null, lastMonth: null, ytd: null },
	{ accountKey: 'rowOverheads', mtd: null, lastMonth: null, ytd: null },
	{ accountKey: 'rowNetProfit', mtd: 5_729_000, lastMonth: 15_041_000, ytd: 388_377_000, emphasis: true },
];
