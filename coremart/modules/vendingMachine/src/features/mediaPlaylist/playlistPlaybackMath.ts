import type { PlaylistMediaPlayState, PlaylistMediaRow } from './types';


export const MIN_PLAYLIST_CLIP_SEC = 1;

export const sortByPlayOrder = (rows: PlaylistMediaRow[]) =>
	[...rows].sort((a, b) => a.order - b.order);

export const effectiveClipSec = (sec?: number) => Math.max(sec ?? 0, MIN_PLAYLIST_CLIP_SEC);

export const sumClipDurations = (items: PlaylistMediaRow[]) =>
	items.reduce((sum, row) => sum + effectiveClipSec(row.durationSec), 0);

export function activeSegmentIndex(playlistElapsedSec: number, sorted: PlaylistMediaRow[]): number {
	let acc = 0;
	const t = Math.max(0, playlistElapsedSec);
	for (let i = 0; i < sorted.length; i++) {
		const d = effectiveClipSec(sorted[i].durationSec);
		if (t < acc + d - 1e-9) return i;
		acc += d;
	}
	return Math.max(0, sorted.length - 1);
}

export function segmentStartSec(targetIndex: number, sorted: PlaylistMediaRow[]): number {
	let acc = 0;
	for (let i = 0; i < targetIndex; i++) {
		acc += effectiveClipSec(sorted[i].durationSec);
	}
	return acc;
}

/** Offset đầu segment — export cho `<video>` / preview. */
export function playlistSegmentStartSec(targetIndex: number, mediaRows: PlaylistMediaRow[]): number {
	return segmentStartSec(targetIndex, sortByPlayOrder(mediaRows));
}

export function effectivePlaylistClipSec(sec?: number): number {
	return effectiveClipSec(sec);
}

export function splitPlaylistElapsed(
	playlistElapsedSec: number,
	sorted: PlaylistMediaRow[],
): { activeIndex: number; activeMediaId: string | null; clipElapsedSec: number } {
	if (sorted.length === 0) {
		return { activeIndex: 0, activeMediaId: null, clipElapsedSec: 0 };
	}
	const t = Math.max(0, playlistElapsedSec);
	let acc = 0;
	for (let i = 0; i < sorted.length; i++) {
		const d = effectiveClipSec(sorted[i].durationSec);
		const end = acc + d;
		if (t < end - 1e-9) {
			return { activeIndex: i, activeMediaId: sorted[i].id, clipElapsedSec: t - acc };
		}
		acc = end;
	}
	const last = sorted.length - 1;
	const ld = effectiveClipSec(sorted[last].durationSec);
	return { activeIndex: last, activeMediaId: sorted[last].id, clipElapsedSec: ld };
}

export function buildPlaylistFingerprint(sorted: PlaylistMediaRow[]): string {
	return sorted.map((r) => `${r.id}:${r.order}:${effectiveClipSec(r.durationSec)}`).join('|');
}

export function stateAfterClipFinished(
	sorted: PlaylistMediaRow[],
	finishedMediaId: string,
	keepPlaying: boolean,
): PlaylistMediaPlayState | null {
	const idx = sorted.findIndex(m => m.id === finishedMediaId);
	if (idx < 0) return null;
	const total = sumClipDurations(sorted);
	if (idx >= sorted.length - 1) {
		const last = sorted[idx];
		return {
			isPlaying: false,
			playlistElapsedSec: total,
			activeMediaId: last.id,
			clipElapsedSec: effectiveClipSec(last.durationSec),
		};
	}
	const nextIdx = idx + 1;
	const next = sorted[nextIdx];
	return {
		isPlaying: keepPlaying,
		playlistElapsedSec: segmentStartSec(nextIdx, sorted),
		activeMediaId: next.id,
		clipElapsedSec: 0,
	};
}

export function playStatesClose(a: PlaylistMediaPlayState, b: PlaylistMediaPlayState): boolean {
	return (
		a.isPlaying === b.isPlaying &&
		a.activeMediaId === b.activeMediaId &&
		Math.abs(a.playlistElapsedSec - b.playlistElapsedSec) < 0.03 &&
		Math.abs(a.clipElapsedSec - b.clipElapsedSec) < 0.03
	);
}
