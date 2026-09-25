import { Game } from '../games/types';
import { Kiosk } from '../kiosks/types';
import { Playlist } from '../mediaPlaylist/types';
import { Theme } from '../themes/types';


/** Junction `vdmc_kiosk_event_rel` (kiosk ↔ kiosk_event many-to-many). */
export interface KioskEventRel {
	kioskId: string;
	eventId: string;
}

/** `vending_machine.kiosk_event_stock` row (camelCase REST). */
export interface EventStock {
	id: string;
	etag: string;
	eventRef: string;
	productRef: string;
	sellPrice: string;
	scopeType?: string | null;
	scopeRef?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** UI lifecycle by event window (start/end); independent of `isArchived`. */
export type EventRunPhase = 'upcoming' | 'ongoing' | 'ended';

/**
 * Schedule phase from `start_time` / `end_time` vs `now`:
 * - upcoming: now < start
 * - ongoing: start <= now <= end
 * - ended: now > end
 */
export function deriveEventRunPhase(
	ev: Pick<Event, 'startTime' | 'endTime'>,
	nowMs: number = Date.now(),
): EventRunPhase {
	const start = new Date(ev.startTime).getTime();
	const end = new Date(ev.endTime).getTime();
	if (Number.isNaN(start) || Number.isNaN(end) || start > end) return 'ended';
	if (nowMs < start) return 'upcoming';
	if (nowMs > end) return 'ended';
	return 'ongoing';
}

/**
 * `vending_machine.kiosk_event` REST resource after camelCase keying (snake_case on wire).
 * Optional relations are enrichment from expands / mocks.
 */
export interface Event {
	id: string;
	code: string;
	name: string;
	description?: string | null;
	startTime: string;
	endTime: string;
	dailyStartTime: string;
	dailyEndTime: string;
	isAllDay: boolean;

	shoppingScreenPlaylistRef?: string | null;
	waitingScreenPlaylistRef?: string | null;
	themeRef?: string | null;
	gameRef?: string | null;

	etag: string;
	isArchived?: boolean | null;
	scopeType?: string | null;
	scopeRef?: string | null;
	createdAt: string;
	updatedAt?: string | null;

	theme?: Theme;
	game?: Game;
	shoppingScreenPlaylist?: Playlist;
	waitingScreenPlaylist?: Playlist;
	kiosks?: Kiosk[];
	stocks?: EventStock[];
}

export type EventCreateFormData = {
	code: string,
	name: string,
	description?: string,
	startTime: string,
	endTime: string,
	dailyStartTime: string,
	dailyEndTime: string,
	isAllDay: boolean,
	shoppingScreenPlaylistRef?: string | null,
	waitingScreenPlaylistRef?: string | null,
	themeRef?: string | null,
	gameRef?: string | null,
};

export type EventUpdateFormData = { id: string, etag: string } & Partial<
	Omit<Event, 'id' | 'etag' | 'createdAt' | 'kiosks' | 'theme' | 'game' |
		'shoppingScreenPlaylist' | 'waitingScreenPlaylist' | 'stocks'>
>;

export type EventUpdatePatch = Partial<Omit<Event, 'id' | 'createdAt' | 'etag'>>;