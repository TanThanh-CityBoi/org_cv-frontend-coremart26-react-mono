import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { eventCrudService } from './eventService';
import { eventStockCrudService } from './eventStockService';
import {
	KIOSK_EVENT_SCHEMA_NAME,
	KIOSK_EVENT_STOCK_SCHEMA_NAME,
	VENDING_MACHINE_MODULE,
} from '../../constants';


/** Schema-driven generic names (`core.resource.vending_machine_kiosk_event.*`). */
export const EventCommands = Object.freeze({ ...resourceCommands(KIOSK_EVENT_SCHEMA_NAME) });

/** Schema-driven generic names (`core.resource.vending_machine_kiosk_event_stock.*`). */
export const EventStockCommands = Object.freeze({ ...resourceCommands(KIOSK_EVENT_STOCK_SCHEMA_NAME) });

/**
 * Registers the event and event-stock services for the generic CRUD path.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands, and subscribing them here would shadow it. `bulkCreate` is deliberately not
 * exposed as a command: it is not part of the generic resource contract.
 */
export function registerEventCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(KIOSK_EVENT_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_EVENT_SCHEMA_NAME, eventCrudService);

	registerSchemaModule(KIOSK_EVENT_STOCK_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_EVENT_STOCK_SCHEMA_NAME, eventStockCrudService);

	return () => {};
}
