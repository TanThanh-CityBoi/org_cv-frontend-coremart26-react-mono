import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { PLAYLIST_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


/**
 * CRUD over `vending_machine_playlist`.
 *
 * A flat resource, so all ten operations come from {@link OrgScopedCrudService}.
 *
 * The playlist↔media link operations (`{base}/:id/kiosk-media-items`) are **not** here. They
 * stay on the legacy `mediaPlaylistService` object literal: those routes are absent from
 * `transport/restful/index.go`, and they are a nested collection with an ordering contract
 * (`replacePlaylistKioskMedias` PUTs the whole ordered list) that does not map onto
 * `manageM2m`. Migrating them needs the real endpoint shape first.
 *
 * Named `mediaPlaylistCrudService` while the legacy literal owns the plain name.
 */
@storeService('MediaPlaylistService', vendingMachineStore)
export class MediaPlaylistService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: PLAYLIST_SCHEMA_NAME });
	}
}

export const mediaPlaylistCrudService = new MediaPlaylistService();
