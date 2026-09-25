export type PnlLineInputs = {
	salesRevenue: number,
	refunds: number,
	promotions: number,
	cogs: number,
	financialRevenue: number,
	financialExpense: number,
	electricity: number,
	internet: number,
	rent: number,
	fixedOther: number,
	partnerDiscount: number,
	gatewayMomo: number,
	gatewayVietqr: number,
	gatewayMpos: number,
	expiredGoodsCost: number,
	variableOther: number,
	adminExpense: number,
	otherIncome: number,
	otherExpense: number,
	vatRateOnDiff: number,
	corporateIncomeTaxRate: number,
};

export type PnlComputed = {
	deductionsTotal: number,
	netRevenue: number,
	grossProfit: number,
	fixedTotal: number,
	variableTotal: number,
	sellingExpenseTotal: number,
	netOperatingProfit: number,
	otherProfit: number,
	profitBeforeTax: number,
	vatAmount: number,
	citAmount: number,
	totalTax: number,
	profitAfterTax: number,
};

export type PnlDashboardKpi = {
	totalRevenue: number,
	totalGrossProfit: number,
	returnOnAssetsPct: number,
	totalOperatingProfit: number,
	returnOnEquityPct: number,
	totalNetProfit: number,
};

export type PnlOperatingMonthRow = {
	month: string,
	revenue: number,
	expenses: number,
	operatingMarginPct: number,
};

export type PnlProfitTrendMonthRow = {
	month: string,
	grossProfit: number,
	grossMarginPct: number,
	operatingProfit: number,
	operatingMarginPct: number,
	netProfit: number,
	netMarginPct: number,
};

export type PnlExpenseSlice = {
	key: string,
	value: number,
};

export type PnlStackedMonthRow = {
	month: string,
	[K: string]: string | number | undefined,
};

export type PnlStatementTableRow = {
	accountKey: string,
	mtd: number | null,
	lastMonth: number | null,
	ytd: number | null,
	emphasis?: boolean,
};

export type DonutDatasetPack = {
	label: string,
	data: number[],
	backgroundColor: string[],
	borderWidth: number,
	borderColor: string,
};
