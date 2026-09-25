import { registerCrudService, registerSchemaModule } from '@nikkierp/common/dynamicModel';
import { describe, expect, it, vi } from 'vitest';

import { PaymentCommands, registerPaymentCommands } from './commands';
import { PAYMENT_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';


vi.mock('@nikkierp/common/dynamicModel', async (importOriginal) => ({
	...(await importOriginal<typeof import('@nikkierp/common/dynamicModel')>()),
	registerCrudService: vi.fn(),
	registerSchemaModule: vi.fn(),
}));


const CRUD_NAMES = [
	'CREATE', 'DELETE', 'UPDATE', 'GET_BY_ID', 'GET_ONE',
	'SEARCH', 'EXISTS', 'SET_IS_ARCHIVED', 'GET_MODEL_SCHEMA', 'MANAGE_M2M',
] as const;


describe('payment commands', () => {
	it('carries the ten generic resource command names', () => {
		expect(Object.keys(PaymentCommands).sort()).toEqual([...CRUD_NAMES].sort());

		for (const name of CRUD_NAMES) {
			expect(PaymentCommands[name]).toContain(PAYMENT_SCHEMA_NAME);
		}
	});

	it('registers the schema module and the CRUD service', () => {
		const bus = { subscribe: vi.fn(), publish: vi.fn() };

		registerPaymentCommands(bus as never);

		expect(registerSchemaModule).toHaveBeenCalledWith(PAYMENT_SCHEMA_NAME, VENDING_MACHINE_MODULE);
		expect(registerCrudService).toHaveBeenCalledWith(PAYMENT_SCHEMA_NAME, expect.anything());
	});

	// The valuable assertion: CRUD is served by the Shell's single `core.resource.*` prefix
	// subscription. A module that subscribed these names would shadow it.
	it('subscribes nothing on the command bus', () => {
		const bus = { subscribe: vi.fn(), publish: vi.fn() };

		registerPaymentCommands(bus as never);

		expect(bus.subscribe).not.toHaveBeenCalled();
	});
});
