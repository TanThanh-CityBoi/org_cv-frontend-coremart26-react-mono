import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';
import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_MEDIA_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type { ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';


const MEDIA_PATH = 'v1/vending_machine/kiosk-media';


/**
 * CRUD over `vending_machine_kiosk_media`.
 *
 * Two operations do not fit the dynamic-model client and keep raw `request.*` calls:
 *
 * - **`upload`** posts `multipart/form-data`. `RestApi` only sends JSON bodies, and the
 *   `Content-Type: undefined` trick (so `ky` lets the browser set the multipart boundary) has
 *   no equivalent there. Same pattern as drive's `fileService.createFile`.
 * - **`updateName`** hits `PUT {base}/:id/name`. The backend exposes **no generic update** for
 *   kiosk-media — `transport/restful/index.go` has only `/kiosk-media/:id/name` — so the
 *   inherited {@link OrgScopedCrudService.update} would 404 and must not be used.
 *
 * Both are annotated, so they still land in the slice like any other operation.
 */
@storeService('KioskMediaService', vendingMachineStore)
export class KioskMediaService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_MEDIA_SCHEMA_NAME });
	}

	/** Multipart upload. See the class note on why this bypasses `RestApi`. */
	@storeAsyncMethod
	public async upload(form: FormData): Promise<ServiceResult<dyn.RestCreateResponse>> {
		const result = await request.post<any>(MEDIA_PATH, {
			body: form,
			// Drop Content-Type so the browser sets the multipart boundary itself.
			headers: { 'Content-Type': undefined },
		});
		return { data: snakeToCamelObject(result) as dyn.RestCreateResponse, clientErrors: [] };
	}

	/** `PUT {base}/:id/name` — the only update this resource has. */
	@storeAsyncMethod
	public async updateName(
		request_: { id: string, etag: string, name: string },
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { id, ...body } = request_;
		const cleaned = cleanEmptyString(body as object);
		const result = await request.put<any>(`${MEDIA_PATH}/${id}/name`, {
			json: camelToSnakeObject(cleaned),
		});
		return { data: snakeToCamelObject(result) as dyn.RestMutateResponse, clientErrors: [] };
	}
}

export const kioskMediaCrudService = new KioskMediaService();
