import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { orderCrudService } from './orderService';
import { ORDER_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';



/** Schema-driven generic names (`core.resource.vending_machine_order.*`). */
export const OrderCommands = Object.freeze({ ...resourceCommands(ORDER_SCHEMA_NAME) });

/**
 * Registers the order service for the generic CRUD path.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands, and subscribing them here would shadow it. `getDetail` and `refundItems` are
 * likewise not exposed as commands: neither is part of the generic resource contract.
 */
export function registerOrderCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(ORDER_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(ORDER_SCHEMA_NAME, orderCrudService);

	return () => {};
}
