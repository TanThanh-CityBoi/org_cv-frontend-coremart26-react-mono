import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';

import { buildFieldsQuery, buildSearchParams } from '@/common/helpers';

import type { VdOrder, VdOrderItem, VdRefundOrderItemsBody } from './types';
import type { PagedSearchResponse, SearchParams } from '@/types';


const BASE_PATH = 'vending-machine/orders';

const ORDER_LIST_FIELDS: Array<keyof VdOrder> = [
	'id',
	'etag',
	'createdAt',
	'updatedAt',
	'scopeType',
	'amount',
	'chainKey',
	'parentOrderRef',
	'parentOrderCode',
	'currency',
	'gatewayRefCode',
	'isArchived',
	'kioskRef',
	'kiosk',
	'orderCode',
	'orderTime',
	'paymentMethod',
	'paymentStatus',
	'refundAmount',
	'refundStatus',
	'status',
	'items',
	'stocks',
	'history',
];

const ORDER_DETAIL_FIELDS: Array<keyof VdOrder | 'items'> = [
	'id',
	'etag',
	'createdAt',
	'updatedAt',
	'kiosk',
	'scopeType',
	'amount',
	'chainKey',
	'currency',
	'gatewayRefCode',
	'parentOrderRef',
	'parentOrderCode',
	'isArchived',
	'kioskRef',
	'orderCode',
	'orderTime',
	'paymentMethod',
	'paymentStatus',
	'refundAmount',
	'refundStatus',
	'status',
	'items',
	'stocks',
	'history',
];

function normalizeItems(raw: unknown): VdOrderItem[] | undefined {
	if (!raw || !Array.isArray(raw)) return undefined;
	return raw.map((row) => snakeToCamelObject(row) as VdOrderItem);
}

/** GET …/orders/detail — chỉ một trong các cặp key/value (wire → query params). */
export type OrderDetailLookupParams = { id: string } | { orderCode: string };

/** Camel field của lookup → tên query gửi lên API. Thêm variant: bổ sung vào union + một key ở đây. */
const ORDER_DETAIL_LOOKUP_QUERY_KEYS = {
	id: 'id',
	orderCode: 'code',
} as const satisfies Record<keyof OrderDetailLookupParams, string>;

function orderDetailLookupToExtra(lookup: OrderDetailLookupParams): Record<string, string> {
	const [paramKey, value] = Object.entries(lookup)[0] as [
		keyof typeof ORDER_DETAIL_LOOKUP_QUERY_KEYS,
		string,
	];
	const wireKey = ORDER_DETAIL_LOOKUP_QUERY_KEYS[paramKey];
	return { [wireKey]: value };
}

export const orderService = {
	async searchOrders(params?: SearchParams<VdOrder>): Promise<PagedSearchResponse<VdOrder>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<VdOrder>({
				...params,
				fields: params?.fields?.length ? params.fields : ORDER_LIST_FIELDS,
			}),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<VdOrder>;
	},

	async getOrder(id: string): Promise<VdOrder> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: buildFieldsQuery<VdOrder>(ORDER_DETAIL_FIELDS as Array<keyof VdOrder>),
		});
		const data = snakeToCamelObject(result) as VdOrder & { items?: unknown };
		return {
			...data,
			items: normalizeItems(data.items),
		};
	},

	async getOrderDetail(params: OrderDetailLookupParams): Promise<VdOrder> {
		const result = await request.get<any>(`${BASE_PATH}/detail`, {
			searchParams: buildSearchParams<VdOrder>({
				fields: ORDER_DETAIL_FIELDS,
				extra: orderDetailLookupToExtra(params),
			}),
		});
		const data = snakeToCamelObject(result) as VdOrder & { items?: unknown };
		return {
			...data,
			items: normalizeItems(data.items),
		};
	},

	/** POST …/orders/:id/refund — partial refund by line items. */
	async refundOrderItems(orderId: string, body: VdRefundOrderItemsBody): Promise<void> {
		const cleanedBody = cleanEmptyString(body as object);
		const snakeBody = camelToSnakeObject(cleanedBody);
		await request.post<any>(`${BASE_PATH}/${orderId}/refund`, { json: snakeBody });
	},

};
