import type { DateValue, DatesRangeValue } from '@mantine/dates';


export const REVENUE_REPORT_TYPE = {
	OVERVIEW: 'overview',
	BY_KIOSK: 'byKiosk',
	BY_PAYMENT: 'byPayment',
	BY_PRODUCT: 'byProduct',
} as const;

export type RevenueReportTypeKey = (typeof REVENUE_REPORT_TYPE)[keyof typeof REVENUE_REPORT_TYPE];

/**
 * Maps `reports/revenue?type=…` to {@link RevenueReportTypeKey}.
 * Accepts optional quotes, any casing, and `byPaymentMethod` as an alias of `byPayment`.
 */
export function parseRevenueReportTypeFromUrl(value: string | null | undefined): {
	rawParam: string | null | undefined,
	urlReportType: RevenueReportTypeKey,
} {
	if (value == null || value === '') {
		return {
			rawParam: value,
			urlReportType: REVENUE_REPORT_TYPE.OVERVIEW,
		};
	}
	const v = value.replace(/^['"]+|['"]+$/g, '').trim().toLowerCase();
	const map: Record<string, RevenueReportTypeKey> = {
		[REVENUE_REPORT_TYPE.OVERVIEW]: REVENUE_REPORT_TYPE.OVERVIEW,
		[REVENUE_REPORT_TYPE.BY_KIOSK.toLowerCase()]: REVENUE_REPORT_TYPE.BY_KIOSK,
		[REVENUE_REPORT_TYPE.BY_PAYMENT.toLowerCase()]: REVENUE_REPORT_TYPE.BY_PAYMENT,
		bypaymentmethod: REVENUE_REPORT_TYPE.BY_PAYMENT,
		[REVENUE_REPORT_TYPE.BY_PRODUCT.toLowerCase()]: REVENUE_REPORT_TYPE.BY_PRODUCT,
	};
	return {
		rawParam: value,
		urlReportType: map[v] ?? REVENUE_REPORT_TYPE.OVERVIEW,
	};
}

export type RevenueReportFilters = {
	reportType?: RevenueReportTypeKey | null,
	dateRange: DatesRangeValue<DateValue> | undefined,
	timeSlot: { from: string | null, to: string | null },
	kioskIds: string[],
};
