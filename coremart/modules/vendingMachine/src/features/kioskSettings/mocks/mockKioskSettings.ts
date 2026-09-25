
import { mockGames } from '../../games/mockGames';
import { mockKiosks } from '../../kiosks/mocks';
import { mockMediaPlaylists } from '../../mediaPlaylist/mocks/mockMediaPlaylists';
import { mockThemes } from '../../themes/mockThemes';

import type { RestArchiveResponse, PagedSearchResponse } from '../../../types';
import type { KioskSetting, KioskSettingUpdatePatch } from '../types';


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultConfig = { volume: 70, brightness: 80, language: 'vi', auto_start: true };

/** In-memory rows (enriched get adds graph-like fields). */
const mockKioskSettingsData: KioskSetting[] = [
	{
		id: '1',
		code: 'CFG-SELLING',
		name: 'Cài đặt bán hàng cơ bản',
		description: 'Trình chiếu quảng cáo khi chờ, chủ đề mặc định, không trò chơi',
		isArchived: false,
		config: defaultConfig,
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-cfg-001',
	},
	{
		id: '2',
		code: 'CFG-ADS-ONLY',
		name: 'Cài đặt chỉ quảng cáo',
		description: 'Chỉ trình chiếu quảng cáo, không bán hàng',
		isArchived: false,
		config: defaultConfig,
		createdAt: '2024-01-10T09:30:00Z',
		etag: 'etag-cfg-002',
	},
	{
		id: '3',
		code: 'CFG-COCA-COLA',
		name: 'Cài đặt thương hiệu Coca-Cola',
		description: 'Chủ đề đỏ trắng, trình chiếu Coca-Cola, thương hiệu Coca-Cola',
		isArchived: false,
		config: defaultConfig,
		createdAt: '2024-01-20T10:15:00Z',
		etag: 'etag-cfg-003',
	},
	{
		id: '4',
		code: 'CFG-ENTERTAINMENT',
		name: 'Cài đặt giải trí',
		description: 'Chủ đề sinh động, trò chơi mini, trình chiếu đa dạng',
		isArchived: false,
		config: defaultConfig,
		createdAt: '2024-02-01T14:20:00Z',
		etag: 'etag-cfg-004',
	},
	{
		id: '5',
		code: 'CFG-PEPSI',
		name: 'Cài đặt thương hiệu Pepsi',
		description: 'Chủ đề xanh dương, thương hiệu Pepsi',
		isArchived: false,
		config: defaultConfig,
		createdAt: '2024-02-10T11:45:00Z',
		etag: 'etag-cfg-005',
	},
	{
		id: '6',
		code: 'CFG-MINIMAL',
		name: 'Cài đặt tối giản',
		description: 'Giao diện đơn giản, ít trình chiếu, không trò chơi',
		isArchived: true,
		config: { ...defaultConfig, volume: 40 },
		createdAt: '2024-02-20T13:30:00Z',
		etag: 'etag-cfg-006',
	},
];

function cloneRow(s: KioskSetting): KioskSetting {
	return JSON.parse(JSON.stringify(s)) as KioskSetting;
}

export const mockKioskSettings = {
	async searchKioskSettings(page = 0, size = 10): Promise<PagedSearchResponse<KioskSetting>> {
		await delay(400);
		const start = page * size;
		const items = mockKioskSettingsData.slice(start, start + size).map((s) => cloneRow(s));
		return {
			items,
			total: mockKioskSettingsData.length,
			page,
			size,
		};
	},

	async getKioskSetting(id: string): Promise<KioskSetting | undefined> {
		await delay(300);
		const base = mockKioskSettingsData.find((s) => s.id === id);
		if (!base) return undefined;

		const [kiosks, themes, games, mediaPlaylists] = await Promise.all([
			mockKiosks.listKiosks(0, 50),
			mockThemes.listThemes(),
			mockGames.listGames(),
			mockMediaPlaylists.listMediaPlaylists(),
		]);

		const themeRef =
			id === '1' ? themes[0]?.id : id === '3' ? themes[2]?.id : id === '4' ? themes[3]?.id : undefined;
		const gameRef = id === '4' ? games[0]?.id : id === '3' ? games[1]?.id : undefined;
		const waitingScreenPlaylistRef =
			id === '1' ? mediaPlaylists[0]?.id ?? null : id === '2' ? mediaPlaylists[1]?.id ?? null : null;
		const shoppingScreenPlaylistRef =
			id === '1' ? mediaPlaylists[1]?.id ?? null : id === '3' ? mediaPlaylists[0]?.id ?? null : null;

		const enriched: KioskSetting = {
			...cloneRow(base),
			kiosks:
				id === '1' ? [kiosks.items[0], kiosks.items[1]] :
					id === '3' ? [kiosks.items[0], kiosks.items[2], kiosks.items[3]] : [],
			themeRef,
			gameRef,
			waitingScreenPlaylistRef,
			shoppingScreenPlaylistRef,
			themeSetting: id === '1' ? themes[0] : id === '3' ? themes[2] : id === '4' ? themes[3] : undefined,
			gameSetting: id === '4' ? games[0] : id === '3' ? games[1] : undefined,
			waitingScreenPlaylistSetting: id === '1' ? mediaPlaylists[0] : id === '2' ? mediaPlaylists[1] : undefined,
			shoppingScreenPlaylistSetting: id === '1' ? mediaPlaylists[1] : id === '3' ? mediaPlaylists[0] : undefined,
		};
		return enriched;
	},

	async createKioskSetting(setting: Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>): Promise<KioskSetting> {
		await delay(500);
		const next: KioskSetting = {
			...setting,
			id: String(mockKioskSettingsData.length + 100),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			etag: `etag-cfg-${Date.now()}`,
			isArchived: setting.isArchived ?? false,
			config: setting.config ?? defaultConfig,
		};
		mockKioskSettingsData.push(next);
		return cloneRow(next);
	},

	async updateKioskSetting(
		id: string,
		_etag: string,
		updates: KioskSettingUpdatePatch,
	): Promise<KioskSetting> {
		await delay(400);
		const index = mockKioskSettingsData.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error('Kiosk setting not found');
		}
		const prev = mockKioskSettingsData[index];
		const merged: KioskSetting = {
			...prev,
			...updates,
			updatedAt: new Date().toISOString(),
			etag: `etag-cfg-${Date.now()}`,
		};
		mockKioskSettingsData[index] = merged;
		return cloneRow(merged);
	},

	async deleteKioskSetting(id: string): Promise<void> {
		await delay(400);
		const index = mockKioskSettingsData.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error('Kiosk setting not found');
		}
		mockKioskSettingsData.splice(index, 1);
	},

	async setArchivedKioskSetting(
		id: string,
		payload: { etag: string, isArchived: boolean },
	): Promise<RestArchiveResponse> {
		await delay(400);
		const index = mockKioskSettingsData.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error('Kiosk setting not found');
		}
		const row = mockKioskSettingsData[index];
		const etag = `etag-cfg-${Date.now()}`;
		mockKioskSettingsData[index] = {
			...row,
			isArchived: payload.isArchived,
			etag,
			updatedAt: new Date().toISOString(),
		};
		return {
			affectedCount: 1,
			affectedAt: new Date().toISOString(),
			etag,
		};
	},
};
