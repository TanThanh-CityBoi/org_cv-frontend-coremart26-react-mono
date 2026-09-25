import * as request from '@nikkierp/common/request';
import { snakeToCamelObject, camelToSnakeObject, cleanEmptyString } from '@nikkierp/common/utils';

import { buildFieldsQuery, buildSearchParams } from '@/common/helpers';

import { SettingCreatePayload } from './hooks/useSettingCreate';
import { SettingUpdatePayload } from './hooks/useSettingEdit';
import { Setting } from './types';

import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	RestArchiveResponse,
	PagedSearchResponse,
	SearchParams,
} from '@/types';


const BASE_PATH = 'vending-machine/settings';


export const settingService = {
	async searchSettings(params?: SearchParams<Setting>): Promise<PagedSearchResponse<Setting>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<Setting>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Setting>;
	},

	async getSetting(id: string, fields?: Array<keyof Setting>): Promise<Setting> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: buildFieldsQuery<Setting>(fields ?? []),
		});
		return snakeToCamelObject(result) as Setting;
	},

	async createSetting(body: SettingCreatePayload): Promise<RestCreateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);
		const result = await request.post<any>(BASE_PATH, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateSetting({ id, body }: SettingUpdatePayload): Promise<RestUpdateResponse> {
		const cleanedBody = cleanEmptyString(body);
		const snakeBody = camelToSnakeObject(cleanedBody);
		const result = await request.put<any>(`${BASE_PATH}/${id}`, { json: snakeBody });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async setArchivedSetting(id: string, body: { etag: string; isArchived: boolean }): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, { json: snakeBody });
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	async deleteSetting(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},
};
