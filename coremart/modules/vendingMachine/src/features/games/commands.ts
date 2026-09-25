import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { gameCrudService } from './gameService';
import { GAME_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';



/** Schema-driven generic names (`core.resource.vending_machine_game.*`). */
export const GameCommands = Object.freeze({ ...resourceCommands(GAME_SCHEMA_NAME) });

/**
 * Registers the game service for the generic CRUD path.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands, and subscribing them here would shadow it.
 */
export function registerGameCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(GAME_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(GAME_SCHEMA_NAME, gameCrudService);

	return () => {};
}
