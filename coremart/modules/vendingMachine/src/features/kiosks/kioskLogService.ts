import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_LOG_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


/**
 * Read access to `vending_machine_kiosk_log`.
 *
 * Flat (`v1/vending_machine/kiosk-logs`) despite belonging to a kiosk — the backend mounts it at
 * the module root, so a kiosk is a search filter rather than a path segment. Unlike kiosk-stocks,
 * this needs no `primaryResourceId`.
 *
 * The backend exposes only `GET`, `GET /:id` and `exists`; the inherited mutations have no route
 * behind them and must not be called.
 */
@storeService('KioskLogService', vendingMachineStore)
export class KioskLogService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_LOG_SCHEMA_NAME });
	}
}

export const kioskLogService = new KioskLogService();
