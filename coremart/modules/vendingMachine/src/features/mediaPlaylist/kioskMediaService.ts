import * as request from '@nikkierp/common/request';
import { camelToSnakeObject, cleanEmptyString, snakeToCamelObject } from '@nikkierp/common/utils';

import { buildFieldsQuery, buildSearchParams } from '../../common/helpers';

import type { GalleryMedia, KioskMedia } from './types';
import type {
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	SearchParams,
	RestUpdateResponse,
} from '../../types';




const BASE_PATH = 'vending-machine/kiosk-media';

/** Relative path for GET stream (append to API base URL). */
export function kioskMediaStreamPath(kioskMediaId: string): string {
	return `${BASE_PATH}/${kioskMediaId}/stream`;
}

/** Full URL for `<img>` / `<video>` preview (same origin as `BASE_API_URL`, e.g. `…/v1`). */
export function buildKioskMediaStreamAbsoluteUrl(baseApiUrl: string, kioskMediaId: string): string {
	const base = baseApiUrl.replace(/\/$/, '');
	return `${base}/${BASE_PATH}/${kioskMediaId}/stream`;
}



/** Stream URL from current `initRequestMaker` base URL (falls back to relative path if not inited). */
export function getKioskMediaStreamUrl(kioskMediaId: string, baseApiUrl: string): string {
	return buildKioskMediaStreamAbsoluteUrl(baseApiUrl, kioskMediaId);
}

export function inferKioskGalleryMediaType(mediaType: string): 'image' | 'video' {
	const t = (mediaType || '').toLowerCase();
	return t.includes('video') ? 'video' : 'image';
}

/** Map API `KioskMedia` sang `GalleryMedia` cho modal gallery (stream URL + nhóm scope). */
export function mapKioskMediaToGalleryMedia(km: KioskMedia, baseApiUrl: string): GalleryMedia {
	const type = inferKioskGalleryMediaType(km.mediaType);
	const streamUrl = getKioskMediaStreamUrl(km.id, baseApiUrl);
	return {
		...km,
		type,
		url: streamUrl,
		thumbnailUrl: type === 'image' ? streamUrl : undefined,
		code: km.storageKey || km.id,
	};
}

/** Multipart POST `vending-machine/kiosk-media` — `name` + `file` (file phải là `File`/`Blob`, không phải chuỗi đường dẫn). */
export function buildKioskMediaCreateFormData(params: { name: string, file: File }): FormData {
	const form = new FormData();
	form.append('name', params.name.trim());
	form.append('file', params.file);
	return form;
}

export const kioskMediaService = {
	async searchKioskMedias(params?: SearchParams<KioskMedia>): Promise<PagedSearchResponse<KioskMedia>> {
		const result = await request.get<any>(BASE_PATH, {
			searchParams: buildSearchParams<KioskMedia>(params),
		});
		return snakeToCamelObject(result) as PagedSearchResponse<KioskMedia>;
	},

	async getKioskMediaById(id: string, fields?: Array<keyof KioskMedia>): Promise<KioskMedia> {
		const result = await request.get<any>(`${BASE_PATH}/${id}`, {
			searchParams: buildFieldsQuery<KioskMedia>(fields ?? []),
		});
		return snakeToCamelObject(result) as KioskMedia;
	},

	async createKioskMedia(form: FormData): Promise<RestCreateResponse> {
		const result = await request.post<any>(BASE_PATH, {
			body: form,
			// Cùng pattern drive `fileService.createFile`: gỡ Content-Type để boundary đúng.
			headers: { 'Content-Type': undefined },
		});
		return snakeToCamelObject(result) as RestCreateResponse;
	},

	async updateKioskMediaName(id: string, body: { etag: string, name: string }): Promise<RestUpdateResponse> {
		const cleaned = cleanEmptyString(body as object);
		const result = await request.put<any>(`${BASE_PATH}/${id}/name`, { json: camelToSnakeObject(cleaned) });
		return snakeToCamelObject(result) as RestUpdateResponse;
	},

	async deleteKioskMedia(id: string): Promise<RestDeleteResponse> {
		const result = await request.del<any>(`${BASE_PATH}/${id}`);
		return snakeToCamelObject(result) as RestDeleteResponse;
	},

	async setKioskMediaArchived(id: string, body: { etag: string, isArchived: boolean }): Promise<RestArchiveResponse> {
		const result = await request.post<any>(`${BASE_PATH}/${id}/archived`, {
			json: camelToSnakeObject(body),
		});
		return snakeToCamelObject(result) as RestArchiveResponse;
	},

	/** Tất cả kiosk media chưa archive (phân trang nội bộ). */
	async getAllKioskMediasForGallery(): Promise<KioskMedia[]> {
		const pageSize = 200;
		let page = 0;
		const all: KioskMedia[] = [];
		let total = Infinity;
		while (all.length < total) {
			const res = await kioskMediaService.searchKioskMedias({ page, size: pageSize });
			const items = res.items.filter((km) => km.isArchived !== true);
			all.push(...items);
			total = res.total;
			if (res.items.length === 0) break;
			page += 1;
		}
		return all;
	},
};
