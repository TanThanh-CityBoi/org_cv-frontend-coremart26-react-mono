import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { buildSearchParams } from '../../common/helpers';
import { OrgScopedCrudService } from '../../common/service';
import { ORDER_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type { VdOrder, VdOrderItem, VdRefundOrderItemsBody } from './types';


const BASE_PATH = `v1/${VENDING_MACHINE_MODULE}/orders`;

export const ORDER_DETAIL_FIELDS: Array<keyof VdOrder> = [
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

/** GET …/orders/detail — exactly one of these pairs is sent, as a query param. */
export type OrderDetailLookupParams = { id: string } | { orderCode: string };

/** Camel lookup field → wire query name. New variant: extend the union and add a key here. */
const ORDER_DETAIL_LOOKUP_QUERY_KEYS = {
	id: 'id',
	orderCode: 'code',
} as const satisfies Record<keyof OrderDetailLookupParams, string>;

export type RefundOrderItemsRequest = {
	orderId: string,
	body: VdRefundOrderItemsBody,
};

function orderDetailLookupToExtra(lookup: OrderDetailLookupParams): Record<string, string> {
	const [paramKey, value] = Object.entries(lookup)[0] as [
		keyof typeof ORDER_DETAIL_LOOKUP_QUERY_KEYS,
		string,
	];
	return { [ORDER_DETAIL_LOOKUP_QUERY_KEYS[paramKey]]: value };
}

function normalizeItems(raw: unknown): VdOrderItem[] | undefined {
	if (!raw || !Array.isArray(raw)) return undefined;
	return raw.map((row) => snakeToCamelObject(row) as VdOrderItem);
}


/**
 * CRUD over `vending_machine_order`, plus the two operations that are not generic CRUD.
 *
 * The inherited `getById` covers lookup by id. `getDetail` exists because the order detail page
 * can also arrive with only an **order code**, which the dynamic-model REST surface cannot express
 * — it addresses records by id alone.
 */
@storeService('OrderService', vendingMachineStore)
export class OrderService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: ORDER_SCHEMA_NAME });
	}

	/** GET `…/orders/detail` — resolves an order by id **or** by order code. */
	@storeAsyncMethod
	public async getDetail(lookup: OrderDetailLookupParams): Promise<VdOrder> {
		const result = await request.get<unknown>(`${BASE_PATH}/detail`, {
			searchParams: buildSearchParams<VdOrder>({
				fields: ORDER_DETAIL_FIELDS,
				extra: orderDetailLookupToExtra(lookup),
			}),
		});
		const data = snakeToCamelObject(result) as VdOrder & { items?: unknown };
		return { ...data, items: normalizeItems(data.items) };
	}

	/** POST `…/orders/:id/refund` — partial refund by line items. */
	@storeAsyncMethod
	public async refundItems({ orderId, body }: RefundOrderItemsRequest): Promise<void> {
		const snakeBody = camelToSnakeObject(cleanEmptyString(body as object));
		await request.post<unknown>(`${BASE_PATH}/${encodeURIComponent(orderId)}/refund`, { json: snakeBody });
	}
}

export const orderCrudService = new OrderService();
