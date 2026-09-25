/** Aligns with vdmc_orders / API (camelCase after snakeToCamelObject). */

import { LocalizedName } from '@/common/helpers';

import { Kiosk } from '../kiosks';


export const ORDER_STATUSES = ['idle', 'delivery', 'failed', 'cancelled', 'completed'] as const;
export type VdOrderStatus = (typeof ORDER_STATUSES)[number];

export const TX_LINE_STATUSES = ['pending', 'success', 'failed', 'cancelled'] as const;
export type VdTxLineStatus = (typeof TX_LINE_STATUSES)[number];

export const ORDER_CURRENCIES = ['VND', 'USD'] as const;
export type VdOrderCurrency = (typeof ORDER_CURRENCIES)[number];

export const PAYMENT_METHODS = ['momo', 'vietqr', 'mpos', 'mbbank'] as const;
export type VdPaymentMethod = (typeof PAYMENT_METHODS)[number];


export type VdOrderItemProductInfo = {
	id: string;
	name: LocalizedName;
	productId: string;
	proposedPrice: string;
	sku: string;
	status: string;
};
export type VdOrderItem = {
	id: string;
	etag?: string;
	createdAt?: string;
	orderRef: string;
	productRef: string;
	productInfo?: VdOrderItemProductInfo | null;
	quantity: number;
	quantityOut?: number | null;
	sellPrice: string;
};

export type VdOrder = {
	id: string;
	etag: string;
	createdAt: string;
	updatedAt?: string;
	scopeType: string;
	// order info
	amount: string;
	chainKey: string; // mã chuỗi đơn hàng
	parentOrderRef?: string;
	parentOrderCode?: string;
	currency: VdOrderCurrency;
	gatewayRefCode: string; // mã đơn ref tới cổng thanh toán
	isArchived: boolean;
	kioskRef: string; // ref kiosk tạo đơn
	kiosk?: Kiosk;
	orderCode: string;
	orderTime: string;
	paymentMethod: VdPaymentMethod;
	paymentStatus: VdTxLineStatus;
	refundAmount: string;
	refundStatus?: VdTxLineStatus | null;
	status: VdOrderStatus;
	items?: VdOrderItem[];
	stocks?: any[];
	history?: any[];
	//
	updateLogs?: any[];
};

/** Request body POST …/orders/:id/refund (camelCase; sent as snake_case). */
export type VdRefundOrderItem = {
	id: string;
	quantity: number;
};

export type VdRefundOrderInfo = {
	providerName: string;
	providerCode: string;
	requestUser?: string;
};

export type VdRefundOrderItemsBody = {
	manualRefund: boolean;
	items: VdRefundOrderItem[];
	refundInfo: VdRefundOrderInfo;
};

