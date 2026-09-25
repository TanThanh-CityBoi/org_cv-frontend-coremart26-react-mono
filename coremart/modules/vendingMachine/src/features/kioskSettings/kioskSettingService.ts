import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { KioskSetting } from './types';
import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_SETTING_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type { ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';



/** Default list page size. Moved here from `kioskSettingSlice.ts` when that slice was deleted. */
export const KIOSK_SETTING_DEFAULT_PAGE_SIZE = 10;

/**
 * Fields the detail page requests.
 *
 * Moved here from `kioskSettingSlice.ts` when that slice was deleted — it is a property of
 * the resource, not of the Redux plumbing that used to fetch it.
 */
export const KIOSK_SETTING_DETAIL_FIELDS: Array<keyof KioskSetting> = [
	'id',
	'etag',
	'code',
	'name',
	'description',
	'isArchived',
	'config',
	'shoppingScreenPlaylistRef',
	'waitingScreenPlaylistRef',
	'themeRef',
	'gameRef',
	'scopeType',
	'shoppingScreenPlaylistSetting',
	'waitingScreenPlaylistSetting',
	'themeSetting',
	'gameSetting',
	'createdAt',
	'updatedAt',
];


/**
 * CRUD over `vending_machine_kiosk_setting`, plus kiosk assignment.
 *
 * The ten CRUD operations come from {@link OrgScopedCrudService} by inheritance.
 *
 * ⚠ `manageKiosks` posts to `{base}/:id/manage-kiosk`, matching what the legacy
 * `kioskSettingService` did. **That route is not in `transport/restful/index.go`** — the only
 * `manage-*` routes there are `/kiosks/:id/manage-events` and `/kiosks/:id/manage-payments`.
 * It is wired here on the explicit assumption that the endpoint exists (or will); if kiosk
 * assignment 404s, this is the first place to look, not the calling hook.
 *
 * Named `kioskSettingCrudService` for the duration of the migration: the legacy object literal
 * in `kioskSettingService.ts` still owns the plain name. Rename once that file is gone.
 */
@storeService('KioskSettingService', vendingMachineStore)
export class KioskSettingService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_SETTING_SCHEMA_NAME });
	}

	/**
	 * Assigns/unassigns kiosks to the setting identified by `settingId`.
	 *
	 * `manageM2m` builds `{base}/{path}` and interpolates no id of its own, so the id is
	 * folded into the path here — giving `kiosk-settings/{settingId}/manage-kiosk`, which is
	 * what the legacy `kioskSettingService.manageKioskSettingKiosks` posted to.
	 *
	 * Annotated because an added method carries no inherited annotation — without
	 * `@storeAsyncMethod` it would be an ordinary helper with no presence in the slice.
	 */
	@storeAsyncMethod
	public manageKiosks(
		request: dyn.RestManageM2mRequest & { settingId: string },
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { settingId, ...body } = request;
		return this.manageM2m(body, `${encodeURIComponent(settingId)}/manage-kiosk`);
	}
}

export const kioskSettingCrudService = new KioskSettingService();
