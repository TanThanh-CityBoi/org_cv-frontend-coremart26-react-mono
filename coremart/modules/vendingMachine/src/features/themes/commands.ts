import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { themeCrudService } from './themeService';
import { THEME_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';



/** Schema-driven generic names (`core.resource.vending_machine_theme.*`). */
export const ThemeCommands = Object.freeze({ ...resourceCommands(THEME_SCHEMA_NAME) });

/**
 * Registers the theme service for the generic CRUD path.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands, and subscribing them here would shadow it.
 */
export function registerThemeCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(THEME_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(THEME_SCHEMA_NAME, themeCrudService);

	return () => {};
}
