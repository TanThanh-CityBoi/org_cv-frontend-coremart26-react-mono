import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { THEME_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


/**
 * CRUD over `vending_machine_theme`.
 *
 * Replaces the mock-backed `themeService`, which read from the `mockThemes` fixture and never
 * reached the network. The backend serves the full flat resource at
 * `/v1/vending_machine/themes` (including `meta/schema` and `PATCH`), so nothing bespoke is
 * needed here.
 */
@storeService('ThemeService', vendingMachineStore)
export class ThemeService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: THEME_SCHEMA_NAME });
	}
}

export const themeCrudService = new ThemeService();
