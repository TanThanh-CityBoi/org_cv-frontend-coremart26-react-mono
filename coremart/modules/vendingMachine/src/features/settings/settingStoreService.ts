import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { buildFieldsQuery, buildSearchParams } from '../../common/helpers';
import { VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type { SettingCreatePayload } from './hooks/useSettingCreate';
import type { SettingUpdatePayload } from './hooks/useSettingEdit';
import type { Setting } from './types';
import type {
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	RestUpdateResponse,
	SearchParams,
} from '../../types';


const BASE_PATH = `v1/${VENDING_MACHINE_MODULE}/settings`;

export type GetSettingRequest = { id: string, fields?: Array<keyof Setting> };
export type SetSettingArchivedRequest = { id: string, etag: string, isArchived: boolean };
export type DeleteSettingRequest = { id: string };


/**
 * Vending-machine settings.
 *
 * **Not a `StoreCrudServiceBase`.** There is no `vending_machine_setting` dynamic-model schema —
 * the backend declares only `vending_machine_kiosk_setting`, which is the separate resource
 * `features/kioskSettings/` already owns. So this is a plain `@storeService` wrapping the
 * existing REST calls: it gets a module-store slice and `useServiceLayer`, but no schema-driven
 * CRUD and **no automatic events** (publish manually if a fan-out is ever wanted).
 *
 * The `settings` route is not in the vending_machine route table yet; per the module's standing
 * ruling that is unbuilt UI rather than a missing endpoint, so it is wired as if it exists.
 */
@storeService('SettingService', vendingMachineStore)
export class SettingService {
	@storeAsyncMethod
	public async search(params?: SearchParams<Setting>): Promise<PagedSearchResponse<Setting>> {
		const result = await request.get<unknown>(BASE_PATH, {
			searchParams: buildSearchParams<Setting>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Setting>;
	}

	@storeAsyncMethod
	public async getById({ id, fields }: GetSettingRequest): Promise<Setting> {
		const result = await request.get<unknown>(`${BASE_PATH}/${encodeURIComponent(id)}`, {
			searchParams: buildFieldsQuery<Setting>(fields ?? []),
		});
		return snakeToCamelObject(result) as Setting;
	}

	@storeAsyncMethod
	public async create(body: SettingCreatePayload): Promise<RestCreateResponse> {
		const snakeBody = camelToSnakeObject(cleanEmptyString(body));
		const result = await request.post<unknown>(BASE_PATH, { json: snakeBody });
		return snakeToCamelObject(result) as RestCreateResponse;
	}

	@storeAsyncMethod
	public async update({ id, body }: SettingUpdatePayload): Promise<RestUpdateResponse> {
		const snakeBody = camelToSnakeObject(cleanEmptyString(body));
		const result = await request.put<unknown>(`${BASE_PATH}/${encodeURIComponent(id)}`, { json: snakeBody });
		return snakeToCamelObject(result) as RestUpdateResponse;
	}

	@storeAsyncMethod
	public async setIsArchived({ id, ...body }: SetSettingArchivedRequest): Promise<RestArchiveResponse> {
		const snakeBody = camelToSnakeObject(body);
		const result = await request.post<unknown>(
			`${BASE_PATH}/${encodeURIComponent(id)}/archived`,
			{ json: snakeBody },
		);
		return snakeToCamelObject(result) as RestArchiveResponse;
	}

	@storeAsyncMethod
	public async delete({ id }: DeleteSettingRequest): Promise<RestDeleteResponse> {
		const result = await request.del<unknown>(`${BASE_PATH}/${encodeURIComponent(id)}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	}
}

export const settingStoreService = new SettingService();
