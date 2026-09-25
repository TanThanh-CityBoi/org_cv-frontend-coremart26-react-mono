import { PagedSearchResponse } from '@/types';


export type RevenueOverview = {
	totalRevenue: string;
	orderCount: number;

	averageRevenue: string;
	averageRevenuePerOrder: string;

	totalItemCount: number;
	totalSuccessItemCount: number;

	totalRefund: string;
	refundedOrderCount: number;
	cancelledOrderCount: number;
};

export type RevenueReportByHour = {
	hour: number;
	orderCount: number;
	cancelledOrderCount: number;
	refundedOrderCount: number;
	totalItemCount: number;
	totalSuccessItemCount: number;
	totalRevenue: string;
	averageRevenue: string;
	totalRefund: string;
};

export type RevenueReportByOrderTime = {
	orderTime: string;
	orderCount: number;
	cancelledOrderCount: number;
	refundedOrderCount: number;
	totalItemCount: number;
	totalSuccessItemCount: number;
	totalRevenue: string;
	averageRevenue: string;
	totalRefund: string;
};

export type RevenueReportByKiosk = {
	kioskId: string;
	kioskName: string;
	orderCount: number;
	cancelledOrderCount: number;
	refundedOrderCount: number;
	totalItemCount: number;
	totalSuccessItemCount: number;
	totalRevenue: string;
	averageRevenue: string;
	totalRefund: string;
};

export type RevenueReportByProduct = {
	productId: string;
	productName: {
		'en-US': string;
		'vi-VN': string;
	};
	totalItemCount: number;
	totalRevenue: string;
};

export type RevenueReportByCategory = {
	categoryId: string;
	categoryName: {
		'en-US': string;
		'vi-VN': string;
	};
	totalItemCount: number;
	totalRevenue: string;
};

export type RevenueReportByPaymentMethod = {
	paymentMethod: string;
	name: string;
	orderCount: number;
	cancelledOrderCount: number;
	refundedOrderCount: number;
	totalItemCount: number;
	totalSuccessItemCount: number;
	totalRevenue: string;
	averageRevenue: string;
	totalRefund: string;
};

export type ReportOverview<ReportType = any> = {
	averageRevenue: string;
	averangeOrderCount: string;

	highestRevenueStats: ReportType;
	lowestRevenueStats: ReportType;
	highestOrderCountStats: ReportType;
	lowestOrderCountStats: ReportType;
};

export type RevenueReport<ReportType = any> =  {
	overview: ReportOverview<ReportType>;
	stats: PagedSearchResponse<ReportType>;
};

export type RefundReport<ReportType = any> =  {
	overview: ReportOverview<ReportType>;
	stats: PagedSearchResponse<ReportType>;
};