import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { kioskSettingCrudService } from './kioskSettingService';
import { KIOSK_SETTING_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';


/**
 * Command names for the kiosk-setting resource — the schema-driven generic names
 * (`core.resource.vending_machine_kiosk_setting.*`).
 *
 * Kiosk assignment is deliberately absent: its `manage-kiosk` route does not exist in the
 * backend. See the note on `KioskSettingService`.
 */
export const KioskSettingCommands = Object.freeze({ ...resourceCommands(KIOSK_SETTING_SCHEMA_NAME) });

/**
 * Registers the kiosk-setting service for the generic CRUD path.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands, and subscribing them here would shadow it.
 */
export function registerKioskSettingCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(KIOSK_SETTING_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_SETTING_SCHEMA_NAME, kioskSettingCrudService);

	return () => {};
}
