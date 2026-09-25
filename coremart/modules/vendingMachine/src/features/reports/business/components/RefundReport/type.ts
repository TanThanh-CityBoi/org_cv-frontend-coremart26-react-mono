import { LocalizedName } from '@/common/helpers';

import type { DateValue, DatesRangeValue } from '@mantine/dates';


export type RefundReportAppliedFilters = {
	dateRange: DatesRangeValue<DateValue> | undefined;
	kioskId: string | null;
	kioskLabel: string | null;
	timeSlot: { from: string | null; to: string | null };
};

export type RefundColumnKey =
	| 'occurredAt'
	| 'reference'
	| 'kiosk'
	| 'createdBy'
	| 'refundMethod'
	| 'amount'
	| 'refundedBy'
	| 'reason';



export type KioskRefundBreakdown = {
	kioskName: string;
	refundAmount: number;
	refundOrders: number;
};

export type ProductRefundBreakdown = {
	productName: string;
	refundAmount: number;
	quantity: number;
};

export type MethodRefundRateRow = {
	label: string;
	refundAmount: number;
};

// ---

// {
// 	"total_refund_amount": "-54200",
// 	"refunded_order_count": 2,
// 	"total_order_count": 6,
// 	"refunded_product_count": 2,
// 	"refund_rate_by_product": 22.22222222222222
//  }
export type RefundOverview = {
	totalRefundAmount: string;
	refundedOrderCount: number;
	totalOrderCount: number;
	refundedProductCount: number;
	refundRateByProduct: number;
};


// "kiosk_id": "01K1V9VM000000000000000027",
// "kiosk_name": "Kiosk 04",
// "refund_amount": "-14900",
// "refunded_order_count": 1
export type KioskRefundReport = {
	kioskId: string;
	kioskName: string;
	refundAmount: string;
	refundedOrderCount: number;
};


// "payment_method": "mbbank",
// "name": "Seed MB Bank",
// "refund_amount": "-12200",
// "refunded_order_count": 1
export type PaymentMethodRefundReport = {
	paymentMethod: string;
	name: string;
	refundAmount: string;
	refundedOrderCount: number;
};


// {
// 	"product_id": "01K5INV0000000000000000500",
// 	"product_name": {
// 	  "en-US": "Berry",
// 	  "vi-VN": "Dâu"
// 	},
// 	"refund_amount": "-15900",
// 	"refunded_order_count": 1
//   },
export type ProductRefundReport = {
	productId: string;
	productName: LocalizedName;
	refundAmount: string;
	refundedOrderCount: number;
};


// {
// 	"order_time": "2026-05-12T16:15:00Z",
// 	"order_code": "HIST000419MB419",
// 	"kiosk_id": "01K1V9VM000000000000000028",
// 	"kiosk_name": "Kiosk 05",
// 	"refund_amount": "-12200",
// 	"refund_method": "mbbank",
// 	"refund_reason": "system: order failed or some item is undelivered",
// 	"created_by_id": "01JWNNJGS70Y07MBEV3AQ0M526",
// 	"created_by_name": "System",
// 	"created_by_email": "system@nikki.com",
// 	"approve_by_id": "01JZQFDH0N51Q3BFQFMFFGSCSV",
// 	"approve_by_name": "Lê Văn Cường Authz Admin",
// 	"approve_by_email": "le.van.cuong@nikki.com"
//  }
export type OrderRefundReport = {
	orderTime: string;
	orderCode: string;
	kioskId: string;
	kioskName: string;
	refundAmount: string;
	refundMethod: string;
	refundReason: string;
	createdById: string;
	createdByName: string;
	createdByEmail: string;
	approveById: string;
	approveByName: string;
	approveByEmail: string;
};