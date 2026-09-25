import { storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { KIOSK_EVENT_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';

import type { ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * CRUD over `vending_machine_kiosk_event`, plus kiosk assignment.
 *
 * Named `eventCrudService` while the legacy `eventService` object literal owns the plain name.
 */
@storeService('EventService', vendingMachineStore)
export class EventService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: KIOSK_EVENT_SCHEMA_NAME });
	}

	/**
	 * `POST {base}/:id/manage-kiosks`.
	 *
	 * As with the other M2M ops, the id is folded into the path — `manageM2m` builds
	 * `{base}/{path}` and interpolates none of its own.
	 *
	 * ⚠ This route is not in `transport/restful/index.go`; wired on the assumption it exists.
	 */
	@storeAsyncMethod
	public manageKiosks(
		request: dyn.RestManageM2mRequest & { eventId: string },
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { eventId, ...body } = request;
		return this.manageM2m(body, `${encodeURIComponent(eventId)}/manage-kiosks`);
	}
}

export const eventCrudService = new EventService();
