import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { paymentService } from './paymentService';
import { PAYMENT_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';


/**
 * Command names for the payment resource.
 *
 * These are the schema-driven generic names (`core.resource.vending_machine_payment.*`),
 * served by the Shell's single `core.resource.*` prefix subscription. Payment has no
 * non-CRUD operations, so there is nothing to add to them.
 */
export const PaymentCommands = Object.freeze({ ...resourceCommands(PAYMENT_SCHEMA_NAME) });

/**
 * Registers the payment service for the generic CRUD path. Called synchronously during
 * the micro-app `init` so lazy command resolution finds it.
 *
 * **Subscribes nothing.** The ten CRUD commands are served by the Shell's single
 * `core.resource.*` prefix subscription; subscribing them here would shadow it. The
 * returned teardown is therefore a no-op, kept for signature symmetry with the other
 * `register*Commands` functions.
 */
export function registerPaymentCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PAYMENT_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(PAYMENT_SCHEMA_NAME, paymentService);

	return () => {};
}
