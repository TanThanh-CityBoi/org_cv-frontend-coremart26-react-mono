import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type { ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * CRUD over `vending_machine_kiosk`, plus its two M2M operations.
 *
 * Introduced early, during APPST-008a, because `useKioskListInSetting` searches **kiosks**
 * through what used to be the kiosk-setting slice — so the setting slice could not be deleted
 * until a kiosk service existed. The rest of the kiosk feature (~41 consumers, ~14 hooks)
 * still runs on `kioskSlice.ts` and migrates in APPST-008b.
 *
 * Named `kioskCrudService` while the legacy `kioskService` object literal still owns the plain
 * name. Rename in APPST-008b once that file is gone.
 */
@storeService('KioskService', vendingMachineStore)
export class KioskService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_SCHEMA_NAME });
	}

	/** `POST /kiosks/:id/manage-events` — the id is folded into the path, as `manageM2m` adds none. */
	@storeAsyncMethod
	public manageEvents(
		request: dyn.RestManageM2mRequest & { kioskId: string },
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { kioskId, ...body } = request;
		return this.manageM2m(body, `${encodeURIComponent(kioskId)}/manage-events`);
	}

	/** `POST /kiosks/:id/manage-payments`. */
	@storeAsyncMethod
	public managePayments(
		request: dyn.RestManageM2mRequest & { kioskId: string },
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { kioskId, ...body } = request;
		return this.manageM2m(body, `${encodeURIComponent(kioskId)}/manage-payments`);
	}
}

export const kioskCrudService = new KioskService();
