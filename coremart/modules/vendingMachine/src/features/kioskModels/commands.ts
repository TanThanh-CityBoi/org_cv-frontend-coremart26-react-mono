import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { kioskModelCrudService } from './kioskModelService';
import { KIOSK_MODEL_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';


/**
 * Command names for the kiosk-model resource — the schema-driven generic names
 * (`core.resource.vending_machine_kiosk_model.*`). No non-CRUD operations exist.
 */
export const KioskModelCommands = Object.freeze({ ...resourceCommands(KIOSK_MODEL_SCHEMA_NAME) });

/**
 * Registers the kiosk-model service for the generic CRUD path.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands, and subscribing them here would shadow it.
 */
export function registerKioskModelCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(KIOSK_MODEL_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_MODEL_SCHEMA_NAME, kioskModelCrudService);

	return () => {};
}
