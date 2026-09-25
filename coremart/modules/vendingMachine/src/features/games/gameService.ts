import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service';
import { GAME_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';
import { vendingMachineStore } from '../../store';


/**
 * CRUD over `vending_machine_game`.
 *
 * Replaces the mock-backed `gameService`. The backend serves the full flat resource at
 * `/v1/vending_machine/games`.
 *
 * **Game versions are not a resource.** `versions` is an array field on the game record, so
 * `addGameVersion` / `deleteGameVersion` become ordinary `update` calls that rewrite the whole
 * array — see `useGameVersions`. There is no `games/:id/versions` route.
 */
@storeService('GameService', vendingMachineStore)
export class GameService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: VENDING_MACHINE_MODULE, schemaName: GAME_SCHEMA_NAME });
	}
}

export const gameCrudService = new GameService();
