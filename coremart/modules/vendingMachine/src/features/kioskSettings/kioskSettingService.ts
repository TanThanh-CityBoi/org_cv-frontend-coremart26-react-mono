/**
 * Bruno: `CoreMart26 - API/VendingMachine/Kiosk Setting/*`.
 * `/v1/vending-machine/kiosk-settings` — search, create, get, update, delete, exists, archived.
 */

import * as request from '@nikkierp/common/request';
import {
	camelToSnakeObject,
	cleanEmptyString,
	snakeToCamelObject,
} from '@nikkierp/common/utils';
import { HTTPError } from 'ky';

import { buildFieldsQuery, buildSearchParams } from '@/common/helpers';

import type { KioskSettingCreatePayload, KioskSettingUpdatePayload } from './hooks/kioskSettingPayloads';
import type { KioskSetting } from './types';
import type {
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	RestUpdateResponse,
	SearchParams,
} from '@/types';


const BASE_PATH = 'vending-machine/kiosk-settings';

export type KioskSettingArchivePayload = { etag: string; isArchived: boolean };

/** Bruno `Kiosk Setting - Exists` → `dyn.ExistsResultData`. */
export type KioskSettingExistsResult = {
	existing: string[];
	notExisting: string[];
};

export const kioskSettingService = {
	basePath: BASE_PATH,

	async searchKioskSettings(params?: SearchParams<KioskSetting>): Promise<PagedSearchResponse<KioskSetting>> {
		const result = await request.get<unknown>(BASE_PATH, {
			searchParams: buildSearchParams<KioskSetting>({
				...params,
				page: params?.page ?? 0,
				size: params?.size ?? 10,
				extra: { ...params?.extra },
			}),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<KioskSetting>;
	},

	async getKioskSetting(
		id: string,
		fields?: Array<keyof KioskSetting>,
	): Promise<KioskSetting | undefined> {
		const client = request.ky();
		if (!client) throw new Error('Must call initRequestMaker() before sending requests');
		try {
			const result = await client.get(`${BASE_PATH}/${encodeURIComponent(id)}`, {
				searchParams: buildFieldsQuery<KioskSetting>(fields ?? []),
			}).json<Record<string, unknown>>();
			return snakeToCamelObject(result) as KioskSetting;
		}
		catch (err) {
			if (err instanceof HTTPError && err.response.status === 404) return undefined;
			throw err;
		}
	},

	async createKioskSetting(body: KioskSettingCreatePayload): Promise<RestCreateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);
		const result = await request.post<unknown>(BASE_PATH, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateKioskSetting(payload: KioskSettingUpdatePayload): Promise<RestUpdateResponse> {
		const cleanedBody = cleanEmptyString(payload.body);
		const snakeBody = camelToSnakeObject(cleanedBody);
		const result = await request.put<unknown>(
			`${BASE_PATH}/${encodeURIComponent(payload.id)}`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deleteKioskSetting(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<unknown>(`${BASE_PATH}/${encodeURIComponent(id)}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setArchivedKioskSetting(id: string, body: KioskSettingArchivePayload): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject({ etag: body.etag, isArchived: body.isArchived });
		const result = await request.post<unknown>(
			`${BASE_PATH}/${encodeURIComponent(id)}/archived`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	/** Bruno `Kiosk Setting - Manage Kiosk` → `POST …/kiosk-settings/:id/manage-kiosk`. */
	async manageKioskSettingKiosks(
		settingId: string,
		body: { add: string[]; remove: string[] },
	): Promise<RestUpdateResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<unknown>(
			`${BASE_PATH}/${encodeURIComponent(settingId)}/manage-kiosk`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async kioskSettingExists(ids: string[]): Promise<KioskSettingExistsResult> {
		const result = await request.post<unknown>(`${BASE_PATH}/exists`, {
			json: { ids },
		});
		return snakeToCamelObject(result) as KioskSettingExistsResult;
	},
};
