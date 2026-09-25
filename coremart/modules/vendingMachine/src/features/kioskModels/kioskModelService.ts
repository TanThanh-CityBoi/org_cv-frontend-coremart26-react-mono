import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_MODEL_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


/**
 * CRUD over `vending_machine_kiosk_model`.
 *
 * A flat resource with no custom endpoints, so all ten operations come from
 * {@link OrgScopedCrudService} by inheritance and nothing needs declaring.
 *
 * Named `kioskModelCrudService` for the duration of the migration: the legacy object literal
 * in `kioskModelService.ts` still owns the plain name while other call sites depend on it.
 * Rename once that file is gone.
 */
@storeService('KioskModelService', vendingMachineStore)
export class KioskModelService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_MODEL_SCHEMA_NAME });
	}
}

export const kioskModelCrudService = new KioskModelService();
