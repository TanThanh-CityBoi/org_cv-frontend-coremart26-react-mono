/**
 * Bruno: `CoreMart26 - API/VendingMachine/Event/*`.
 * Base: `/v1/vending-machine/events` — search (GET), create, get by id, update, delete, exists,
 * archived, manage-kiosks (POST add/remove kiosk links).
 */

import * as request from '@nikkierp/common/request';
import {
	camelToSnakeObject,
	cleanEmptyString,
	snakeToCamelObject,
} from '@nikkierp/common/utils';

import { buildFieldsQuery, buildSearchParams } from '@/common/helpers';

import type { Event, EventCreateFormData, EventUpdatePatch } from './types';
import type {
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	RestUpdateResponse,
	SearchParams,
} from '@/types';


export const BASE_PATH = 'vending-machine/events';

const DEFAULT_SEARCH_PAGE_SIZE = 10;

export type EventArchivePayload = { etag: string; isArchived: boolean };

/** Bruno `Event - Exists` → `dyn.ExistsResultData`. */
export type EventExistsResult = {
	existing: string[];
	notExisting: string[];
};

export const eventService = {
	basePath: BASE_PATH,

	async searchEvents(params?: SearchParams<Event>): Promise<PagedSearchResponse<Event>> {
		const merged: SearchParams<Event> = {
			page: params?.page ?? 0,
			size: params?.size ?? DEFAULT_SEARCH_PAGE_SIZE,
			...params,
		};
		const result = await request.get<unknown>(BASE_PATH, {
			searchParams: buildSearchParams<Event>(merged),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Event>;
	},

	async getEvent(id: string, fields?: Array<keyof Event>): Promise<Event | undefined> {
		const result = await request.get<unknown>(`${BASE_PATH}/${encodeURIComponent(id)}`, {
			searchParams: buildFieldsQuery<Event>(fields ?? []),
		});
		return snakeToCamelObject(result) as Event;
	},

	async createEvent(body: EventCreateFormData): Promise<RestCreateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);

		const result = await request.post<unknown>(BASE_PATH, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateEvent(id: string, etag: string, patch: EventUpdatePatch): Promise<RestUpdateResponse> {
		const cleanedPatch = cleanEmptyString(patch);
		const snakeBody = camelToSnakeObject({ etag, ...cleanedPatch });
		const result = await request.put<unknown>(
			`${BASE_PATH}/${encodeURIComponent(id)}`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deleteEvent(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<unknown>(`${BASE_PATH}/${encodeURIComponent(id)}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setArchivedEvent(id: string, body: EventArchivePayload): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject({ etag: body.etag, isArchived: body.isArchived });
		const result = await request.post<unknown>(
			`${BASE_PATH}/${encodeURIComponent(id)}/archived`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	async eventExists(ids: string[]): Promise<EventExistsResult> {
		const result = await request.post<unknown>(`${BASE_PATH}/exists`, {
			json: { ids },
		});
		return snakeToCamelObject(result) as EventExistsResult;
	},

	/** Bruno `Event - Manage Kiosks` → `POST …/events/:id/manage-kiosks`. */
	async manageEventKiosks(
		eventId: string,
		body: { add: string[]; remove: string[] },
	): Promise<RestUpdateResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<unknown>(
			`${BASE_PATH}/${encodeURIComponent(eventId)}/manage-kiosks`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestUpdateResponse;
	},
};
