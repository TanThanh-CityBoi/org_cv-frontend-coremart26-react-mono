import type { KioskSetting } from '../types';


/** POST …/kiosk-settings — Bruno `Kiosk Setting - Create`. */
export type KioskSettingCreatePayload = Pick<KioskSetting, 'code' | 'name'> & Partial<
	Pick<
		KioskSetting,
		| 'description'
		| 'config'
		| 'shoppingScreenPlaylistRef'
		| 'waitingScreenPlaylistRef'
		| 'themeRef'
		| 'gameRef'
		| 'scopeType'
		| 'isArchived'
	>
>;

/** PUT …/kiosk-settings/:id — domain scalars + `etag` (no expanded edges). */
export type KioskSettingUpdateFormData = {
	id: string,
	etag: string,
} & Partial<
	Omit<
		KioskSetting,
		| 'id'
		| 'createdAt'
		| 'shoppingScreenPlaylistSetting'
		| 'waitingScreenPlaylistSetting'
		| 'themeSetting'
		| 'gameSetting'
	>
>;

export type KioskSettingUpdatePayload = { id: string, body: KioskSettingUpdateFormData };
