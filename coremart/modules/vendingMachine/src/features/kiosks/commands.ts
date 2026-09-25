import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';


import { kioskLogService } from './kioskLogService';
import { kioskCrudService } from './kioskService';
import { kioskStockPositionService } from './kioskStockPositionService';
import { kioskStockService } from './kioskStockService';
import {
	KIOSK_LOG_SCHEMA_NAME,
	KIOSK_SCHEMA_NAME,
	KIOSK_STOCK_POSITION_SCHEMA_NAME,
	KIOSK_STOCK_SCHEMA_NAME,
	VENDING_MACHINE_MODULE,
} from '../../constants';


/** Schema-driven generic names (`core.resource.vending_machine_kiosk.*`). */
export const KioskCommands = Object.freeze({ ...resourceCommands(KIOSK_SCHEMA_NAME) });

/** Schema-driven generic names for the nested stock resource. */
export const KioskStockCommands = Object.freeze({ ...resourceCommands(KIOSK_STOCK_SCHEMA_NAME) });

/**
 * Registers the kiosk services for the generic CRUD path.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands, and subscribing them here would shadow it.
 *
 * ⚠ The stock and position services are **nested** under a kiosk. A command-bus caller reaching
 * them through the generic path has no way to supply the owning kiosk id, so in practice only
 * `kiosk` is usefully callable cross-module; the other three are registered so the schema→module
 * mapping (and therefore the event topic) is correct.
 */
export function registerKioskCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(KIOSK_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_SCHEMA_NAME, kioskCrudService);

	registerSchemaModule(KIOSK_STOCK_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_STOCK_SCHEMA_NAME, kioskStockService);

	registerSchemaModule(KIOSK_STOCK_POSITION_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_STOCK_POSITION_SCHEMA_NAME, kioskStockPositionService);

	registerSchemaModule(KIOSK_LOG_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_LOG_SCHEMA_NAME, kioskLogService);

	return () => {};
}
