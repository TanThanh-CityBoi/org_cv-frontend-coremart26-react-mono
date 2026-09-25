import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { kioskMediaCrudService } from './kioskMediaCrudService';
import { mediaPlaylistCrudService } from './mediaPlaylistCrudService';
import { KIOSK_MEDIA_SCHEMA_NAME, PLAYLIST_SCHEMA_NAME, VENDING_MACHINE_MODULE } from '../../constants';


/** Schema-driven generic names (`core.resource.vending_machine_playlist.*`). */
export const MediaPlaylistCommands = Object.freeze({ ...resourceCommands(PLAYLIST_SCHEMA_NAME) });

/** Schema-driven generic names (`core.resource.vending_machine_kiosk_media.*`). */
export const KioskMediaCommands = Object.freeze({ ...resourceCommands(KIOSK_MEDIA_SCHEMA_NAME) });

/**
 * Registers both services this feature folder owns — playlists and the media library.
 *
 * **Subscribes nothing** — the Shell's `core.resource.*` prefix subscription serves the ten
 * CRUD commands for each schema.
 */
export function registerMediaPlaylistCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PLAYLIST_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(PLAYLIST_SCHEMA_NAME, mediaPlaylistCrudService);

	registerSchemaModule(KIOSK_MEDIA_SCHEMA_NAME, VENDING_MACHINE_MODULE);
	registerCrudService(KIOSK_MEDIA_SCHEMA_NAME, kioskMediaCrudService);

	return () => {};
}
