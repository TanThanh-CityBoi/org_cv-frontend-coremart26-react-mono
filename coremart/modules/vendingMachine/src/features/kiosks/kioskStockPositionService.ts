import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_STOCK_POSITION_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


/**
 * CRUD over `vending_machine_kiosk_stock_position`, **nested** under a kiosk
 * (`v1/vending_machine/kiosks/:kioskId/positions`).
 *
 * Same calling convention as {@link KioskStockService}: the owning kiosk id travels as the
 * trailing `primaryResourceId`, so a dispatch passes `[request, kioskId]`.
 *
 * This resource had no slice before the migration — it is new surface, not a port.
 */
@storeService('KioskStockPositionService', vendingMachineStore)
export class KioskStockPositionService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_STOCK_POSITION_SCHEMA_NAME });
	}
}

export const kioskStockPositionService = new KioskStockPositionService();
