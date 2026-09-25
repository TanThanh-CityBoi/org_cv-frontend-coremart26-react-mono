/**
 * Aligns with CoreMart `vending_machine` domain: playlist, kiosk_media, playlist_kiosk_media.
 * REST base path prefix: `vending-machine/` (via @nikkierp/common/request).
 */

/** API: domain.ResourceScopeType */
export enum ResourceScopeType {
	DOMAIN = 'domain',
	ORG = 'org',
	HIERARCHY = 'hierarchy',
	PRIVATE = 'private',
}

/** API: vending_machine.playlist (vdmc_playlists) */
export interface Playlist {
	id: string;
	name: string;
	etag: string;
	scopeType: ResourceScopeType;
	scopeRef?: string | null;
	isArchived?: boolean | null;

	mediaItems?: KioskMedia[] | null; // ??

	createdAt: string;
	updatedAt?: string | null;
}

/** API: vending_machine.kiosk_media (vdmc_kiosk_media) */
export interface KioskMedia {
	id: string;
	name: string;
	storageKey: string;
	mediaType: string;
	etag: string;
	scopeType: ResourceScopeType;
	scopeRef?: string | null;
	isArchived?: boolean | null;
	createdAt: string;
	updatedAt?: string | null;
	createdBy?: string | null;
	updatedBy?: string | null;
}

export enum ObjectFit {
	FILL = 'fill',
	CONTAIN = 'contain',
	COVER = 'cover',
	NONE = 'none',
	SCALE_DOWN = 'scale-down',
}

/** Mặc định khi API/UI không gửi — khớp CSS `object-fit: contain`. */
export function normalizePlaylistObjectFit(value?: ObjectFit | null): ObjectFit {
	if (value != null && (Object.values(ObjectFit) as string[]).includes(value)) {
		return value;
	}
	return ObjectFit.CONTAIN;
}

/** API: vending_machine.playlist_kiosk_media */
export interface PlaylistKioskMedia {
	id: string;
	playlistRef: string;
	kioskMediaRef: string;
	playOrder?: number | null;
	durationSec?: number | null;
	objectFit?: ObjectFit | null;
	etag?: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** Body item for PUT `/playlists/:id/kiosk-medias` (replace all links). */
export interface PlaylistKioskMediaReplaceItem {
	kioskMediaRef: string;
	durationSec: number;
	playOrder: number;
	objectFit?: ObjectFit | null;
}


/**
 * UI row for playlist detail media table (mapped from PlaylistKioskMedia + KioskMedia).
 */
export interface PlaylistMediaRow {
	id: string;
	kioskMediaRef: string;
	name: string;
	type: 'image' | 'video';
	url: string;
	thumbnailUrl?: string;
	order: number;
	durationSec?: number;
	/** Hiển thị media trong khung preview/kiosk; mặc định `contain`. */
	objectFit?: ObjectFit | null;
}

/** Trạng thái phát playlist (đồng bộ timeline ↔ preview). */
export interface PlaylistMediaPlayState {
	isPlaying: boolean;
	/** Thời lượng đã trôi trên toàn bộ playlist (giây, từ đầu). */
	playlistElapsedSec: number;
	/** `PlaylistMediaRow.id` đang phát. */
	activeMediaId: string | null;
	/** Thời điểm trong clip hiện tại (video: `currentTime`; ảnh: do timeline đếm). */
	clipElapsedSec: number;
}

export interface GalleryFolder {
	id: string;
	name: string;
	parentId?: string;
	children?: GalleryFolder[];
	mediaCount?: number;
}

export interface GalleryMedia extends KioskMedia {
	code: string;
	type: 'image' | 'video';
	url: string;
	thumbnailUrl?: string;
	duration?: number;
	size?: number;
}
