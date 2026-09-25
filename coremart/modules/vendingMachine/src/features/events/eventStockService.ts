/**
 * REST: `/v1/vending-machine/kiosk-event-stocks` (Bruno: Event Stock).
 */

import * as request from '@nikkierp/common/request';
import {
	camelToSnakeObject,
	cleanEmptyString,
	snakeToCamelObject,
} from '@nikkierp/common/utils';

import { buildFieldsQuery, buildSearchParams } from '@/common/helpers';

import { BulkCreateEventStockItem } from './eventSlice';

import type { EventStock } from './types';
import type {
	PagedSearchResponse,
	RestCreateResponse,
	RestDeleteResponse,
	RestUpdateResponse,
	SearchParams,
} from '@/types';


const BASE_PATH = 'vending-machine/events';

export type CreateEventStockBody = {
	eventRef: string;
	productRef: string;
	sellPrice: string;
};

export type UpdateEventStockBody = {
	id: string;
	etag: string;
	eventRef: string;
	productRef: string;
	sellPrice: string;
};

export const eventStockService = {
	async searchEventStocks(
		eventId: string,
		params?: SearchParams<EventStock>,
	): Promise<PagedSearchResponse<EventStock>> {
		const result = await request.get<unknown>(`${BASE_PATH}/${eventId}/event-stocks`, {
			searchParams: buildSearchParams<EventStock>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<EventStock>;
	},

	async getEventStock(
		eventId: string,
		id: string,
		fields?: Array<keyof EventStock>,
	): Promise<EventStock | undefined> {
		const result = await request.get<unknown>(`${BASE_PATH}/${eventId}/${encodeURIComponent(id)}`, {
			searchParams: buildFieldsQuery<EventStock>(fields ?? []),
		});
		return snakeToCamelObject(result) as EventStock;
	},

	async createEventStock(body: CreateEventStockBody): Promise<RestCreateResponse> {
		const { eventRef, ...rest } = body;
		const cleaned = cleanEmptyString(rest);
		const snakeBody = camelToSnakeObject(cleaned);
		const result = await request.post<unknown>(`${BASE_PATH}/${eventRef}/event-stocks`, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async bulkCreateEventStock(eventId: string, body: BulkCreateEventStockItem[]): Promise<RestCreateResponse[]> {
		const snakeBody = body.map((item) => camelToSnakeObject(item));
		const result = await request.post<unknown>(`${BASE_PATH}/${eventId}/event-stocks/bulk`, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse[];
	},

	async updateEventStock(body: UpdateEventStockBody): Promise<RestUpdateResponse> {
		const { eventRef, id, ...rest } = body;
		const cleaned = cleanEmptyString(rest);
		const snakeBody = camelToSnakeObject(cleaned);
		const result = await request.put<unknown>(
			`${BASE_PATH}/${eventRef}/event-stocks/${id}`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deleteEventStock(eventId: string, stockId: string): Promise<RestDeleteResponse> {
		const result = await request.del<unknown>(`${BASE_PATH}/${eventId}/event-stocks/${stockId}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},
};
