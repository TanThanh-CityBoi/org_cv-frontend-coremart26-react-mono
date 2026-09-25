import { ViewMode } from '../../components/ControlPanel/ControlPanel';
import { Game } from '../games/types';
import { Kiosk } from '../kiosks/types';
import { Playlist } from '../mediaPlaylist/types';
import { Theme } from '../themes/types';



/**
 * `vending_machine.kiosk_setting` (+ basemodel id/etag/audit/archive, resource scope).
 * REST: snake_case; FE uses camelCase after `snakeToCamelObject`.
 * Edge keys match domain: `shopping_screen_playlist_setting`, `waiting_screen_playlist_setting`,
 * `theme_setting`, `game_setting`, `kiosks` (present when search `graph` expands).
 */
export interface KioskSetting {
	id: string;
	code: string;
	name: string;
	description?: string | null;
	config?: any | null;
	shoppingScreenPlaylistRef?: string | null;
	waitingScreenPlaylistRef?: string | null;
	themeRef?: string | null;
	gameRef?: string | null;
	isArchived?: boolean;

	/** Bruno create/update; persist only if schema exposes the field in API. */
	etag: string;
	createdAt: string;
	scopeType?: string | null;
	updatedAt?: string | null;

	// ** */
	shoppingScreenPlaylistSetting?: Playlist;
	waitingScreenPlaylistSetting?: Playlist;
	themeSetting?: Theme;
	gameSetting?: Game;
	kiosks?: Kiosk[];
}

// {
// 	"id": "01K1V9VM00000000000000001A",
// 	"code": "setting-01",
// 	"name": "Setting 01",
// 	"description": "Profile 1",
// 	"config": {},
// 	"shopping_screen_playlist_id": "01K1V9VM000000000000000001",
// 	"waiting_screen_playlist_id": "01K1V9VM000000000000000004"
// 	"theme_id": "01K1V9VM000000000000000006",
// 	"game_id": "01K1V9VM00000000000000000B",
// 	"is_archived": false,

// 	"etag": "1778125012604722000",
// 	"created_at": "2026-05-07T03:36:52Z",
// 	"scope_type": "domain",
// 	"updated_at": "2026-05-07T03:36:52Z",
// }

export type KioskSettingUpdatePatch = Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>>;

export type KioskSettingListViewMode = Extract<ViewMode, 'list' | 'grid'>;
