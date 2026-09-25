import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { PAYMENT_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


/**
 * CRUD over `vending_machine_payment`.
 *
 * Declaring no methods is deliberate: all ten operations come from
 * {@link OrgScopedCrudService} by inheritance, and their `@storeAsyncMethod`
 * annotations are inherited with them. Payment is a flat resource with no custom
 * endpoints, so it needs nothing more.
 *
 * The manual `camelToSnakeObject` / `snakeToCamelObject` / `buildSearchParams`
 * plumbing that the old `paymentService` object literal carried is gone — `RestApi`
 * does that conversion itself.
 *
 * Mutations publish `vending_machine:vending_machine_payment:{action}` on the event
 * bus automatically via `CrudServiceBase.emitEvent`; reads emit nothing.
 */
@storeService('PaymentService', vendingMachineStore)
export class PaymentService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: PAYMENT_SCHEMA_NAME });
	}
}

export const paymentService = new PaymentService();
