import * as request from '@nikkierp/common/request';
import {
	camelToSnakeObject,
	cleanEmptyString,
	snakeToCamelObject,
} from '@nikkierp/common/utils';


import { buildFieldsQuery, buildSearchParams } from '@/common/helpers';

import { getKioskMediaStreamUrl, kioskMediaService } from './kioskMediaService';
import {
	normalizePlaylistObjectFit,
	ObjectFit,
	ResourceScopeType,
	type GalleryMedia,
	type Playlist,
	type PlaylistKioskMedia,
	type PlaylistKioskMediaReplaceItem,
	type PlaylistMediaRow,
} from './types';
import { probeVideoDurationSec } from './videoProbe';

import type {
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	SearchParams,
	RestUpdateResponse,
} from '@/types';



const PLAYLIST_BASE_PATH = 'vending-machine/playlists';

function kioskMediaItemsPath(playlistId: string): string {
	return `${PLAYLIST_BASE_PATH}/${playlistId}/kiosk-media-items`;
}


export type PlaylistKioskMediaSearchParams = SearchParams<PlaylistKioskMedia>;

function inferMediaType(mediaType: string): 'image' | 'video' {
	const t = (mediaType || '').toLowerCase();
	return t.includes('video') ? 'video' : 'image';
}

/** Chuẩn bị body PUT `/playlists/:id/kiosk-medias` từ state UI. */
export function playlistMediaRowsToReplaceItems(rows: PlaylistMediaRow[]): PlaylistKioskMediaReplaceItem[] {
	const sorted = [...rows].sort((a, b) => a.order - b.order);
	return sorted.map((row) => ({
		kioskMediaRef: row.kioskMediaRef,
		durationSec: Math.max(0, row.durationSec ?? 0),
		playOrder: row.order,
		objectFit: normalizePlaylistObjectFit(row.objectFit),
	}));
}

const PLAYLIST_SEARCH_FIELDS: Array<keyof Playlist> = [
	'id',
	'name',
	'etag',
	'scopeType',
	'scopeRef',
	'isArchived',
	'createdAt',
	'updatedAt',
];

export const mediaPlaylistService = {
	async searchPlaylists(params?: SearchParams<Playlist>): Promise<PagedSearchResponse<Playlist>> {
		const result = await request.get<any>(PLAYLIST_BASE_PATH, {
			searchParams: buildSearchParams<Playlist>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<Playlist>;
	},

	async getPlaylist(id: string, fields?: Array<keyof Playlist>): Promise<Playlist> {
		const result = await request.get<any>(`${PLAYLIST_BASE_PATH}/${id}`, {
			searchParams: fields?.length ? buildFieldsQuery<Playlist>(fields) : undefined,
		});
		return snakeToCamelObject(result) as Playlist;
	},

	async createPlaylist(body: {
		name: string;
		scopeType: ResourceScopeType;
		scopeRef?: string | null;
	}): Promise<RestCreateResponse> {
		const cleaned = cleanEmptyString(body as object);
		const result = await request.post<any>(PLAYLIST_BASE_PATH, { json: camelToSnakeObject(cleaned) });
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updatePlaylist(
		id: string,
		body: { etag: string } & Partial<Pick<Playlist, 'name' | 'scopeType' | 'scopeRef'>>,
	): Promise<RestUpdateResponse> {
		const cleaned = cleanEmptyString(body as object);
		const result = await request.put<any>(`${PLAYLIST_BASE_PATH}/${id}`, { json: camelToSnakeObject(cleaned) });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deletePlaylist(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${PLAYLIST_BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setPlaylistArchived(id: string, body: { etag: string; isArchived: boolean }): Promise<RestArchiveResponse> {
		const result = await request.post<any>(`${PLAYLIST_BASE_PATH}/${id}/archived`, {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	async searchPlaylistKioskMedias(
		playlistId: string,
		params?: PlaylistKioskMediaSearchParams,
	): Promise<PagedSearchResponse<PlaylistKioskMedia>> {
		const result = await request.get<any>(kioskMediaItemsPath(playlistId), {
			searchParams: buildSearchParams<PlaylistKioskMedia>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<PlaylistKioskMedia>;
	},

	async createPlaylistKioskMedia(playlistId: string, body: Record<string, unknown>): Promise<RestCreateResponse> {
		const result = await request.post<any>(kioskMediaItemsPath(playlistId), {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updatePlaylistKioskMedia(
		playlistId: string,
		linkId: string,
		body: Record<string, unknown>,
	): Promise<RestUpdateResponse> {
		const result = await request.put<any>(`${kioskMediaItemsPath(playlistId)}/${linkId}`, {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deletePlaylistKioskMedia(playlistId: string, linkId: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${kioskMediaItemsPath(playlistId)}/${linkId}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	/** PUT `/playlists/:id/kiosk-media-items` — replaces entire ordered list. */
	async replacePlaylistKioskMedias(
		playlistId: string,
		items: PlaylistKioskMediaReplaceItem[],
	): Promise<RestUpdateResponse> {
		const snakeItems = items.map((item) => camelToSnakeObject(item) as Record<string, unknown>);
		const result = await request.put<any>(kioskMediaItemsPath(playlistId), {
			json: snakeItems,
		});
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async searchMediaPlaylists(params?: SearchParams<Playlist>): Promise<PagedSearchResponse<Playlist>> {
		return mediaPlaylistService.searchPlaylists({
			fields: PLAYLIST_SEARCH_FIELDS,
			...(params || {}),
		});
	},

	async getMediaPlaylist(id: string): Promise<Playlist | undefined> {
		return mediaPlaylistService.getPlaylist(id);
	},

	async loadPlaylistMediaRows(playlistId: string, baseApiUrl: string): Promise<PlaylistMediaRow[]> {
		const links = await mediaPlaylistService.searchPlaylistKioskMedias(playlistId, { size: 500 });
		const rows: PlaylistMediaRow[] = [];
		for (const link of links.items) {
			const km = await kioskMediaService.getKioskMediaById(link.kioskMediaRef);
			const order = link.playOrder ?? 0;
			rows.push({
				id: link.id,
				kioskMediaRef: link.kioskMediaRef,
				name: km.name,
				type: inferMediaType(km.mediaType),
				url: getKioskMediaStreamUrl(link.kioskMediaRef, baseApiUrl),
				order,
				durationSec: link.durationSec ?? undefined,
				objectFit:
					link.objectFit != null ? normalizePlaylistObjectFit(link.objectFit as ObjectFit) : undefined,
			});
		}
		rows.sort((a, b) => a.order - b.order);
		return rows;
	},

	getKioskMediaStreamUrl,

	async createMediaPlaylist(payload: {
		name: string;
		scopeType?: ResourceScopeType;
		scopeRef?: string | null;
	}): Promise<Playlist> {
		const created = await mediaPlaylistService.createPlaylist({
			name: payload.name,
			scopeType: payload.scopeType ?? ResourceScopeType.DOMAIN,
			scopeRef: payload.scopeRef,
		});
		return mediaPlaylistService.getPlaylist(created.id);
	},

	async updateMediaPlaylist(
		id: string,
		etag: string,
		updates: Partial<Pick<Playlist, 'name' | 'scopeType' | 'scopeRef'>>,
	): Promise<Playlist> {
		await mediaPlaylistService.updatePlaylist(id, { etag, ...updates });
		return mediaPlaylistService.getPlaylist(id);
	},

	async deleteMediaPlaylist(id: string): Promise<void> {
		await mediaPlaylistService.deletePlaylist(id);
	},

	async replacePlaylistMedia(playlistId: string, items: PlaylistKioskMediaReplaceItem[]) {
		return mediaPlaylistService.replacePlaylistKioskMedias(playlistId, items);
	},
};

const DEFAULT_IMAGE_CLIP_DURATION_SEC = 15;

function durationSecFromGalleryItem(item: GalleryMedia): number | undefined {
	if (item.type === 'image') {
		return item.duration ?? DEFAULT_IMAGE_CLIP_DURATION_SEC;
	}
	return item.duration;
}

/** Rows without `order`; caller assigns `order` after merging with current playlist state. */
export async function playlistRowsFromGallerySelection(
	selectedMedia: GalleryMedia[],
	baseApiUrl: string,
): Promise<Omit<PlaylistMediaRow, 'order'>[]> {
	const rows: Omit<PlaylistMediaRow, 'order'>[] = [];
	for (let index = 0; index < selectedMedia.length; index++) {
		const item = selectedMedia[index];
		let durationSec = durationSecFromGalleryItem(item);
		const streamUrl = getKioskMediaStreamUrl(item.id, baseApiUrl);
		if (item.type === 'video' && (durationSec == null || durationSec <= 0)) {
			const probed = await probeVideoDurationSec(streamUrl);
			if (probed != null && probed > 0) durationSec = Math.round(probed) || DEFAULT_IMAGE_CLIP_DURATION_SEC;
		}
		rows.push({
			id: `gallery-${item.id}-${index}`,
			kioskMediaRef: item.id,
			name: item.name,
			type: item.type,
			url: streamUrl,
			thumbnailUrl: item.thumbnailUrl,
			durationSec,
			objectFit: ObjectFit.CONTAIN,
		});
	}
	return rows;
}
