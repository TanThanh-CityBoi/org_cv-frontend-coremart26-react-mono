import type {
	PnlComputed,
	PnlLineInputs,
} from './type';
import type { ChartOptions } from 'chart.js';



export const PNL_LINE_INPUTS_ZERO: PnlLineInputs = {
	salesRevenue: 0,
	refunds: 0,
	promotions: 0,
	cogs: 0,
	financialRevenue: 0,
	financialExpense: 0,
	electricity: 0,
	internet: 0,
	rent: 0,
	fixedOther: 0,
	partnerDiscount: 0,
	gatewayMomo: 0,
	gatewayVietqr: 0,
	gatewayMpos: 0,
	expiredGoodsCost: 0,
	variableOther: 0,
	adminExpense: 0,
	otherIncome: 0,
	otherExpense: 0,
	vatRateOnDiff: 10,
	corporateIncomeTaxRate: 20,
};

export function computePnl(i: PnlLineInputs): PnlComputed {
	const deductionsTotal = i.refunds + i.promotions;
	const netRevenue = i.salesRevenue - deductionsTotal;
	const grossProfit = netRevenue - i.cogs;
	const fixedTotal = i.electricity + i.internet + i.rent + i.fixedOther;
	const variableTotal =
		i.partnerDiscount +
		i.gatewayMomo +
		i.gatewayVietqr +
		i.gatewayMpos +
		i.expiredGoodsCost +
		i.variableOther;
	const sellingExpenseTotal = fixedTotal + variableTotal;
	const netOperatingProfit =
		grossProfit + i.financialRevenue - i.financialExpense - sellingExpenseTotal - i.adminExpense;
	const otherProfit = i.otherIncome - i.otherExpense;
	const profitBeforeTax = netOperatingProfit + otherProfit;
	const vatBase = netRevenue - i.cogs;
	const vatAmount = (vatBase * i.vatRateOnDiff) / 100;
	const citAmount = profitBeforeTax > 0 ? (profitBeforeTax * i.corporateIncomeTaxRate) / 100 : 0;
	const totalTax = Math.max(0, vatAmount) + citAmount;
	const profitAfterTax = profitBeforeTax - totalTax;

	return {
		deductionsTotal,
		netRevenue,
		grossProfit,
		fixedTotal,
		variableTotal,
		sellingExpenseTotal,
		netOperatingProfit,
		otherProfit,
		profitBeforeTax,
		vatAmount,
		citAmount,
		totalTax,
		profitAfterTax,
	};
}

export function formatPnlWorksheetMoney(n: number): string {
	return n.toLocaleString('vi-VN');
}

export const PNL_CHART_COLORS = {
	blue: 'rgb(37, 99, 235)',
	blueFill: 'rgba(37, 99, 235, 0.12)',
	yellow: 'rgb(234, 179, 8)',
	red: 'rgb(220, 38, 38)',
	teal: 'rgb(13, 148, 136)',
	rose: 'rgb(225, 29, 72)',
	stackColors: [
		'rgba(37, 99, 235, 0.85)',
		'rgba(220, 38, 38, 0.8)',
		'rgba(234, 179, 8, 0.85)',
		'rgba(13, 148, 136, 0.85)',
		'rgba(99, 102, 241, 0.82)',
		'rgba(217, 119, 6, 0.85)',
		'rgba(100, 116, 139, 0.75)',
	],
	donut: [
		'rgba(37, 99, 235, 0.88)',
		'rgba(220, 38, 38, 0.78)',
		'rgba(234, 179, 8, 0.92)',
		'rgba(13, 148, 136, 0.82)',
		'rgba(99, 102, 241, 0.8)',
		'rgba(217, 119, 6, 0.85)',
		'rgba(100, 116, 139, 0.7)',
	],
} as const;

export const PNL_EXPENSE_ACCOUNT_STACK_KEYS = [
	{ key: 'rentPremises', labelKey: 'dsRent' },
	{ key: 'utilsAndOps', labelKey: 'dsUtils' },
	{ key: 'gatewayAndBank', labelKey: 'dsGateway' },
	{ key: 'partnersDiscount', labelKey: 'dsPartnerDisc' },
	{ key: 'expiredGoods', labelKey: 'dsExpired' },
	{ key: 'adminHr', labelKey: 'dsAdminHr' },
	{ key: 'miscExpense', labelKey: 'dsMisc' },
] as const;

export function pnlChartNumberFormatVi(): Intl.NumberFormat {
	return new Intl.NumberFormat('vi-VN');
}

export function pnlCompactMoney(n: number): string {
	const abs = Math.abs(n);
	const sign = n < 0 ? '−' : '';
	const nfVi = pnlChartNumberFormatVi();
	if (abs >= 1_000_000_000) {
		return `${sign}${(abs / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}B`;
	}
	if (abs >= 1_000_000) {
		return `${sign}${(abs / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M`;
	}
	if (abs >= 1_000) {
		return `${sign}${(abs / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}K`;
	}
	return nfVi.format(n);
}

export function pnlStatementTableCellMoney(n: number | null): string {
	if (n === null || n === undefined) {
		return '—';
	}
	return pnlChartNumberFormatVi().format(n);
}

export function pnlBaseBarTooltipMoney(): Pick<ChartOptions<'bar'>, 'plugins'> {
	return {
		plugins: {
			tooltip: {
				callbacks: {
					label: (ctx) => {
						const v = ctx.parsed;
						const val = typeof v === 'number' ? v : (v as { y?: number }).y ?? 0;
						return `${ctx.dataset.label ?? ''}: ${pnlChartNumberFormatVi().format(val)}`;
					},
				},
			},
		},
	};
}
