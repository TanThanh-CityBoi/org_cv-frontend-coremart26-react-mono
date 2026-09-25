import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Group, Progress, Select, Text, Tooltip } from '@mantine/core';
import { IconGripVertical, IconPlayerPlay, IconPlayerStop, IconRotateClockwise } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
	activeSegmentIndex,
	buildPlaylistFingerprint,
	effectiveClipSec,
	effectivePlaylistClipSec,
	playlistSegmentStartSec,
	playStatesClose,
	segmentStartSec,
	sortByPlayOrder,
	splitPlaylistElapsed,
	sumClipDurations,
} from '../../playlistPlaybackMath';

import type { PlaylistMediaPlayState, PlaylistMediaRow } from '../../types';


export type { PlaylistMediaPlayState };

export type TrialPlaybackState = {
	trialPlaying: boolean,
	elapsedSec: number,
	currentItem: PlaylistMediaRow | null,
};

export { playlistSegmentStartSec, effectivePlaylistClipSec };

const MIN_DURATION_SEC = 1;
const REFERENCE_SECONDS_PER_TRACK = 120;
const IMAGE_TICK_MS = 250;

const renumberOrders = (rows: PlaylistMediaRow[]) =>
	rows.map((row, index) => ({ ...row, order: index + 1 }));

const formatSec = (sec?: number) => {
	if (sec === undefined || sec === null) return '0:00';
	const s = Math.round(sec);
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type ResizeSession = {
	initialX: number,
	index: number,
	trackW: number,
	snapshot: PlaylistMediaRow[],
	initialDuration: number,
};

interface SortableBlockProps {
	item: PlaylistMediaRow;
	weight: number;
	index: number;
	trialActive: boolean;
	onResizePointerDown: (e: React.PointerEvent, index: number) => void;
	onSeekToSegment: (index: number) => void;
	translate: (key: string, options?: Record<string, unknown>) => string;
}

// eslint-disable-next-line max-lines-per-function -- sortable row
function SortableTimelineBlock({
	item,
	weight,
	index,
	trialActive,
	onResizePointerDown,
	onSeekToSegment,
	translate,
}: SortableBlockProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const mergedStyle: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		flexGrow: Math.max(weight, 0.01),
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 48,
		opacity: isDragging ? 0.88 : 1,
		border: trialActive
			? '2px solid var(--mantine-color-blue-filled)'
			: '1px solid var(--mantine-color-gray-4)',
		borderRadius: 6,
		overflow: 'hidden',
	};

	return (
		<Box ref={setNodeRef} display='flex' bg='var(--mantine-color-gray-1)' style={mergedStyle}>
			<Box
				{...attributes}
				{...listeners}
				p={6}
				style={{ cursor: 'grab', touchAction: 'none', flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'flex-start' }}
			>
				<IconGripVertical size={14} style={{ marginTop: 2 }} />
			</Box>
			<Tooltip
				label={translate('media_playlist.media.timeline.seek_item_hint')}
				position='top'
			>
				<Box
					role='button'
					tabIndex={0}
					flex={1}
					p={6}
					onClick={() => onSeekToSegment(index)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onSeekToSegment(index);
						}
					}}
					style={{ cursor: 'pointer', minWidth: 0 }}
				>
					<Group gap={4} wrap='nowrap' align='flex-start'>
						<Box style={{ minWidth: 0 }}>
							<Text size='xs' fw={600} lineClamp={1}>
								{item.order}. {item.name}
							</Text>
							<Text size='xs' c='dimmed'>{formatSec(item.durationSec)}</Text>
						</Box>
					</Group>
				</Box>
			</Tooltip>
			<Tooltip
				label={translate('media_playlist.media.timeline.resize_hint')}
				position='top'
			>
				<Box
					onPointerDown={e => onResizePointerDown(e, index)}
					w={10}
					style={{
						cursor: 'ew-resize',
						touchAction: 'none',
						background: 'var(--mantine-color-gray-4)',
						flexShrink: 0,
					}}
					aria-label={translate('media_playlist.media.timeline.resize_hint')}
				/>
			</Tooltip>
		</Box>
	);
}

function StaticTimelineBlock({
	item,
	weight,
	trialActive,
	onSeekToSegment,
	index,
}: {
	item: PlaylistMediaRow,
	weight: number,
	trialActive: boolean,
	onSeekToSegment: (index: number) => void,
	index: number,
}) {
	const mergedStyle: React.CSSProperties = {
		flexGrow: Math.max(weight, 0.01),
		flexShrink: 1,
		flexBasis: 0,
		minWidth: 48,
		border: trialActive
			? '2px solid var(--mantine-color-blue-filled)'
			: '1px solid var(--mantine-color-gray-4)',
		borderRadius: 6,
		overflow: 'hidden',
		cursor: 'pointer',
	};

	return (
		<Box
			display='flex'
			bg='var(--mantine-color-gray-1)'
			role='button'
			tabIndex={0}
			onClick={() => onSeekToSegment(index)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onSeekToSegment(index);
				}
			}}
			style={mergedStyle}
		>
			<Box flex={1} p={6} style={{ minWidth: 0 }}>
				<Group gap={4} wrap='nowrap' align='flex-start'>
					<Box style={{ minWidth: 0 }}>
						<Text size='xs' fw={600} lineClamp={1}>
							{item.order}. {item.name}
						</Text>
						<Text size='xs' c='dimmed'>{formatSec(item.durationSec)}</Text>
					</Box>
				</Group>
			</Box>
		</Box>
	);
}

function applyResize(session: ResizeSession, clientX: number): PlaylistMediaRow[] {
	const dx = clientX - session.initialX;
	const deltaSec = (dx / session.trackW) * REFERENCE_SECONDS_PER_TRACK;
	const next = session.snapshot.map(m => ({ ...m }));
	const idx = session.index;
	const newDur = Math.max(MIN_DURATION_SEC, session.initialDuration + deltaSec);
	next[idx] = { ...next[idx], durationSec: newDur };
	return renumberOrders(next);
}

const idlePlayState = (): PlaylistMediaPlayState => ({
	isPlaying: false,
	playlistElapsedSec: 0,
	activeMediaId: null,
	clipElapsedSec: 0,
});

export interface PlaylistDurationTimelineProps {
	previewLayout: 'vertical' | 'horizontal';
	setPreviewLayout: (layout: 'vertical' | 'horizontal') => void;
	mediaPlaylist: PlaylistMediaRow[];
	onMediaChange: (items: PlaylistMediaRow[]) => void;
	mediaPlayState: PlaylistMediaPlayState;
	/** Cập nhật phát / tua / tạm dừng / chuyển clip; so sánh giá trị để tránh vòng lặp với player. */
	onPlaystateChange: (next: PlaylistMediaPlayState) => void;
	readOnly?: boolean;
	stopTrialPlaybackSignal?: number;
}

// eslint-disable-next-line max-lines-per-function -- timeline + DnD
export const PlaylistDurationTimeline: React.FC<PlaylistDurationTimelineProps> = ({
	mediaPlaylist,
	previewLayout,
	setPreviewLayout,
	onMediaChange,
	mediaPlayState,
	onPlaystateChange,
	readOnly = false,
	stopTrialPlaybackSignal,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const containerRef = useRef<HTMLDivElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);
	const resizeSessionRef = useRef<ResizeSession | null>(null);
	const lastStopSignalRef = useRef(-1);
	const prevPlaylistFpRef = useRef<string | null>(null);
	const mediaPlayStateRef = useRef(mediaPlayState);
	const sortedRef = useRef<PlaylistMediaRow[]>([]);

	const onPlaystateChangeRef = useRef(onPlaystateChange);
	mediaPlayStateRef.current = mediaPlayState;
	onPlaystateChangeRef.current = onPlaystateChange;

	const emitIfChanged = useCallback((next: PlaylistMediaPlayState) => {
		if (playStatesClose(next, mediaPlayStateRef.current)) return;
		onPlaystateChangeRef.current(next);
	}, []);

	const sortedMedia = useMemo(() => sortByPlayOrder(mediaPlaylist), [mediaPlaylist]);
	sortedRef.current = sortedMedia;

	const playlistFingerprint = useMemo(() => buildPlaylistFingerprint(sortedMedia), [sortedMedia]);

	const totalSec = useMemo(
		() => Math.max(sumClipDurations(sortedMedia), MIN_DURATION_SEC),
		[sortedMedia],
	);

	const totalSecRef = useRef(totalSec);
	totalSecRef.current = totalSec;

	const weights = useMemo(
		() => sortedMedia.map(row => effectiveClipSec(row.durationSec)),
		[sortedMedia],
	);

	const displayElapsed = mediaPlayState.playlistElapsedSec;

	const activeIndex = useMemo(
		() => activeSegmentIndex(displayElapsed, sortedMedia),
		[displayElapsed, sortedMedia],
	);

	const segmentHighlight = (index: number) =>
		(mediaPlayState.isPlaying || displayElapsed > 0) && activeIndex === index;

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	useEffect(() => {
		if (prevPlaylistFpRef.current === null) {
			prevPlaylistFpRef.current = playlistFingerprint;
			return;
		}
		if (prevPlaylistFpRef.current === playlistFingerprint) return;
		prevPlaylistFpRef.current = playlistFingerprint;
		emitIfChanged(idlePlayState());
	}, [playlistFingerprint, emitIfChanged]);

	useEffect(() => {
		if (stopTrialPlaybackSignal === undefined) return;
		if (lastStopSignalRef.current < 0) {
			lastStopSignalRef.current = stopTrialPlaybackSignal;
			return;
		}
		if (lastStopSignalRef.current === stopTrialPlaybackSignal) return;
		lastStopSignalRef.current = stopTrialPlaybackSignal;
		emitIfChanged(idlePlayState());
	}, [stopTrialPlaybackSignal, emitIfChanged]);

	useEffect(() => {
		if (!mediaPlayState.isPlaying) return;
		const row = sortedMedia.find(m => m.id === mediaPlayState.activeMediaId);
		if (!row || row.type !== 'image') return;

		const id = window.setInterval(() => {
			const st = mediaPlayStateRef.current;
			if (!st.isPlaying) return;
			const sorted = sortedRef.current;
			const r = sorted.find(m => m.id === st.activeMediaId);
			if (!r || r.type !== 'image') return;

			const dt = IMAGE_TICK_MS / 1000;
			const nextPlaylist = st.playlistElapsedSec + dt;
			const cap = Math.max(sumClipDurations(sorted), MIN_DURATION_SEC);
			if (nextPlaylist >= cap - 1e-6) {
				const split = splitPlaylistElapsed(cap, sorted);
				emitIfChanged({
					...st,
					isPlaying: false,
					playlistElapsedSec: cap,
					activeMediaId: split.activeMediaId,
					clipElapsedSec: split.clipElapsedSec,
				});
				return;
			}
			const split = splitPlaylistElapsed(nextPlaylist, sorted);
			emitIfChanged({
				...st,
				playlistElapsedSec: nextPlaylist,
				activeMediaId: split.activeMediaId,
				clipElapsedSec: split.clipElapsedSec,
			});
		}, IMAGE_TICK_MS);

		return () => window.clearInterval(id);
	}, [mediaPlayState.isPlaying, mediaPlayState.activeMediaId, sortedMedia, emitIfChanged]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const ordered = sortByPlayOrder(mediaPlaylist);
		const oldIndex = ordered.findIndex(i => i.id === active.id);
		const newIndex = ordered.findIndex(i => i.id === over.id);
		if (oldIndex < 0 || newIndex < 0) return;
		onMediaChange(renumberOrders(arrayMove(ordered, oldIndex, newIndex)));
	};

	const handleResizePointerDown = useCallback(
		(e: React.PointerEvent, index: number) => {
			e.preventDefault();
			e.stopPropagation();
			const track = containerRef.current;
			if (!track || sortedMedia.length === 0) return;
			const trackW = Math.max(track.offsetWidth, 1);
			const ordered = sortByPlayOrder(mediaPlaylist);
			const row = ordered[index];
			resizeSessionRef.current = {
				initialX: e.clientX,
				index,
				trackW,
				snapshot: ordered.map(m => ({ ...m })),
				initialDuration: row.durationSec ?? 0,
			};

			const onMove = (ev: PointerEvent) => {
				const session = resizeSessionRef.current;
				if (!session) return;
				onMediaChange(applyResize(session, ev.clientX));
			};

			const onUp = () => {
				document.removeEventListener('pointermove', onMove);
				document.removeEventListener('pointerup', onUp);
				document.removeEventListener('pointercancel', onUp);
				resizeSessionRef.current = null;
			};

			document.addEventListener('pointermove', onMove);
			document.addEventListener('pointerup', onUp);
			document.addEventListener('pointercancel', onUp);
		},
		[mediaPlaylist, onMediaChange, sortedMedia.length],
	);

	const _handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const el = progressRef.current;
		if (!el || totalSec <= 0) return;
		const rect = el.getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / Math.max(rect.width, 1);
		const nextElapsed = Math.min(totalSec, Math.max(0, ratio * totalSec));
		const split = splitPlaylistElapsed(nextElapsed, sortedMedia);
		emitIfChanged({
			...mediaPlayStateRef.current,
			playlistElapsedSec: nextElapsed,
			activeMediaId: split.activeMediaId,
			clipElapsedSec: split.clipElapsedSec,
		});
	};

	const seekToSegmentAndPlay = useCallback(
		(index: number) => {
			const sorted = sortByPlayOrder(mediaPlaylist);
			const offset = segmentStartSec(index, sorted);
			const id = sorted[index]?.id ?? null;
			emitIfChanged({
				...mediaPlayStateRef.current,
				isPlaying: true,
				playlistElapsedSec: offset,
				activeMediaId: id,
				clipElapsedSec: 0,
			});
		},
		[mediaPlaylist, emitIfChanged],
	);

	const playFromStart = () => {
		const sorted = sortByPlayOrder(mediaPlaylist);
		const first = sorted[0];
		if (!first) return;
		emitIfChanged({
			...mediaPlayStateRef.current,
			isPlaying: true,
			playlistElapsedSec: 0,
			activeMediaId: first.id,
			clipElapsedSec: 0,
		});
	};

	const continueTrial = () => {
		if (displayElapsed >= totalSec - 0.001) {
			playFromStart();
			return;
		}
		emitIfChanged({
			...mediaPlayStateRef.current,
			isPlaying: true,
		});
	};

	const stopTrial = () => {
		emitIfChanged({
			...mediaPlayStateRef.current,
			isPlaying: false,
		});
	};

	if (mediaPlaylist.length === 0) {
		return null;
	}

	const previewLayoutOptions = [
		{
			value: 'vertical',
			label: translate('media_playlist.preview.vertical'),
		},
		{
			value: 'horizontal',
			label: translate('media_playlist.preview.horizontal'),
		},
	];

	const progressPct = totalSec > 0 ? Math.min(100, (displayElapsed / totalSec) * 100) : 0;
	const showTrialTime = mediaPlayState.isPlaying || displayElapsed > 0;
	const showResumeControls = !mediaPlayState.isPlaying && displayElapsed > 0;

	return (
		<Box w='100%'>
			<Group justify='space-between' mb='xs' wrap='wrap'>
				<Box>
					<Select
						data={previewLayoutOptions}
						value={previewLayout}
						onChange={(v) => v && setPreviewLayout(v as 'vertical' | 'horizontal')}
						clearable={false}
						w={{ base: '100%', sm: 360 }}
						maw={420}
					/>
				</Box>
				<Group gap='xs' wrap='wrap' justify='flex-end'>
					<Text size='sm' c='dimmed'>
						{translate('media_playlist.media.timeline.total_duration')}:{' '}
						{formatSec(totalSec)}
					</Text>
					{mediaPlayState.isPlaying ? (
						<Button
							size='xs'
							variant='light'
							color='red'
							leftSection={<IconPlayerStop size={14} />}
							onClick={stopTrial}
						>
							{translate('media_playlist.media.timeline.trial_stop')}
						</Button>
					) : showResumeControls ? (
						<Group gap='xs' wrap='nowrap'>
							<Button
								size='xs'
								variant='light'
								leftSection={<IconRotateClockwise size={14} />}
								onClick={playFromStart}
							>
								{translate('media_playlist.media.timeline.trial_play_from_start')}
							</Button>
							<Button
								size='xs'
								variant='light'
								leftSection={<IconPlayerPlay size={14} />}
								onClick={continueTrial}
							>
								{translate('media_playlist.media.timeline.trial_resume')}
							</Button>
						</Group>
					) : (
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlayerPlay size={14} />}
							onClick={playFromStart}
						>
							{translate('media_playlist.media.timeline.trial_play')}
						</Button>
					)}
				</Group>
			</Group>

			<Box mb='sm'>
				{/* <Tooltip label={translate('media_playlist.media.timeline.seek_progress_hint')}> */}
				<Box
					ref={progressRef}
					//? Tạm bỏ handleProgressClick do api stream không thể tua video
					// onClick={handleProgressClick}
					style={{ cursor: 'pointer' }}
				>
					<Progress
						value={progressPct}
						size='sm'
						transitionDuration={mediaPlayState.isPlaying ? 80 : 0}
					/>
				</Box>
				{/* </Tooltip> */}
				{showTrialTime ? (
					<Text size='xs' c='dimmed' mt={4}>
						{translate('media_playlist.media.timeline.trial_position')}:{' '}
						{formatSec(displayElapsed)} / {formatSec(totalSec)}
					</Text>
				) :
					<Text size='xs' c='dimmed' mt={4}>
						{`00:00 / 00:00`}
					</Text>
				}
			</Box>

			{readOnly ? (
				<Box
					ref={containerRef}
					display='flex'
					mih={56}
					style={{ overflowX: 'auto' }}
				>
					{sortedMedia.map((item, index) => (
						<StaticTimelineBlock
							key={item.id}
							item={item}
							index={index}
							weight={weights[index] ?? MIN_DURATION_SEC}
							trialActive={segmentHighlight(index)}
							onSeekToSegment={seekToSegmentAndPlay}
						/>
					))}
				</Box>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={sortedMedia.map(i => i.id)}
						strategy={horizontalListSortingStrategy}
					>
						<Box
							ref={containerRef}
							display='flex'
							mih={56}
							style={{ overflowX: 'auto' }}
						>
							{sortedMedia.map((item, index) => (
								<SortableTimelineBlock
									key={item.id}
									item={item}
									weight={weights[index] ?? MIN_DURATION_SEC}
									index={index}
									trialActive={segmentHighlight(index)}
									onResizePointerDown={handleResizePointerDown}
									onSeekToSegment={seekToSegmentAndPlay}
									translate={translate}
								/>
							))}
						</Box>
					</SortableContext>
				</DndContext>
			)}
		</Box>
	);
};
