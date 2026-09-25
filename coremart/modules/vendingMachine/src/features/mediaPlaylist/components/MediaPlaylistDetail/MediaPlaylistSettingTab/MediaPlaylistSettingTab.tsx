/* eslint-disable max-lines-per-function */
import { Box, Center, Divider, Grid, Stack, TextInput } from '@mantine/core';
import { useShellEnvVars } from '@nikkierp/shell/config';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { mediaPlaylistActions, selectUpdateMediaPlaylist, VendingMachineDispatch } from '@/appState';
import { MediaGalleryModal } from '@/features/mediaPlaylist/components/MediaGalleryModal';
import { MediaList } from '@/features/mediaPlaylist/components/MediaList';
import { MediaPlaylistDetailModals } from '@/features/mediaPlaylist/components/MediaPlaylistDetailModals/MediaPlaylistDetailModals';
import { MediaPlaylistPreviewHorizontal } from '@/features/mediaPlaylist/components/MediaPlaylistPreviewHorizontal';
import { MediaPlaylistPreviewVertical } from '@/features/mediaPlaylist/components/MediaPlaylistPreviewVertical';
import { PlaylistDurationTimeline } from '@/features/mediaPlaylist/components/PlaylistDurationTimeline';
import {
	mediaPlaylistService,
	playlistMediaRowsToReplaceItems,
	playlistRowsFromGallerySelection,
} from '@/features/mediaPlaylist/mediaPlaylistService';
import { playStatesClose, playlistSegmentStartSec, stateAfterClipFinished } from '@/features/mediaPlaylist/playlistPlaybackMath';
import {
	type GalleryMedia,
	type Playlist,
	type PlaylistKioskMediaReplaceItem,
	type PlaylistMediaPlayState,
	type PlaylistMediaRow,
} from '@/features/mediaPlaylist/types';

import { useMediaPlaylistSettingTab } from './useMediaPlaylistSettingTab';


function playlistReplacePayloadEqual(a: PlaylistKioskMediaReplaceItem[], b: PlaylistKioskMediaReplaceItem[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		const x = a[i];
		const y = b[i];
		if (
			x.kioskMediaRef !== y.kioskMediaRef ||
			x.playOrder !== y.playOrder ||
			x.durationSec !== y.durationSec ||
			(x.objectFit ?? null) !== (y.objectFit ?? null)
		) {
			return false;
		}
	}
	return true;
}

function clonePlaylistMediaRows(rows: PlaylistMediaRow[]): PlaylistMediaRow[] {
	return rows.map((r) => ({ ...r }));
}

export const MediaPlaylistSettingTab: React.FC<{ playlist: Playlist }> = ({ playlist }) => {
	const { t: translate } = useTranslation();
	const { notification } = useUIState();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const [galleryModalOpened, setGalleryModalOpened] = useState(false);

	const [playlistMedia, setPlaylistMedia] = useState<PlaylistMediaRow[]>([]);
	const [draftName, setDraftName] = useState('');
	const [isSavingMedia, setIsSavingMedia] = useState(false);

	const [previewLayout, setPreviewLayout] = useState<'vertical' | 'horizontal'>('vertical');

	const [selectedPreviewMediaId, setSelectedPreviewMediaId] = useState<string | null>(null);

	const [stopTrialPlaybackSignal, setStopTrialPlaybackSignal] = useState(0);

	const [mediaPlayState, setMediaPlayState] = useState<PlaylistMediaPlayState>({
		isPlaying: false,
		playlistElapsedSec: 0,
		activeMediaId: null,
		clipElapsedSec: 0,
	});

	const mergePlayback = useCallback((next: PlaylistMediaPlayState) => {
		setMediaPlayState((prev) => (playStatesClose(next, prev) ? prev : next));
	}, []);

	const applyPlayback = useCallback((patch: Partial<PlaylistMediaPlayState>) => {
		setMediaPlayState((prev) => {
			const next = { ...prev, ...patch };
			return playStatesClose(next, prev) ? prev : next;
		});
	}, []);

	const handleClipEnded = useCallback(() => {
		setMediaPlayState((prev) => {
			if (!prev.activeMediaId) return prev;
			const sorted = [...playlistMedia].sort((a, b) => a.order - b.order);
			const advanced = stateAfterClipFinished(sorted, prev.activeMediaId, true);
			return advanced ?? { ...prev, isPlaying: false };
		});
	}, [playlistMedia]);

	const envVars = useShellEnvVars();

	const reloadMediaRows = useCallback(async (playlistId: string) => {
		const rows = await mediaPlaylistService.loadPlaylistMediaRows(playlistId, envVars.BASE_API_URL);
		setPlaylistMedia(rows);
	}, [envVars.BASE_API_URL]);

	const savedPlaylistMediaRef = useRef<PlaylistMediaRow[]>([]);
	const updateOutcome = useMicroAppSelector(selectUpdateMediaPlaylist);
	const updateRequestIdRef = useRef<string | null>(null);
	const pendingPersistPlaylistIdRef = useRef<string | null>(null);
	const pendingPersistRowsRef = useRef<PlaylistMediaRow[] | null>(null);
	const setIsEditingRef = useRef<(value: boolean) => void>(() => {});

	const finishPersistSuccess = useCallback(
		async (playlistId: string, rowsSnapshot: PlaylistMediaRow[]) => {
			dispatch(mediaPlaylistActions.getMediaPlaylist(playlistId));
			await reloadMediaRows(playlistId);
			savedPlaylistMediaRef.current = clonePlaylistMediaRows(rowsSnapshot);
			setIsEditingRef.current(false);
			notification.showInfo(
				translate('coremart.vendingMachine.mediaPlaylist.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
			setIsSavingMedia(false);
		},
		[dispatch, reloadMediaRows, notification, translate],
	);

	useEffect(() => {
		const requestId = updateOutcome.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateOutcome.status === 'success') {
			updateRequestIdRef.current = null;

			const pid = pendingPersistPlaylistIdRef.current;
			const rows = pendingPersistRowsRef.current;

			pendingPersistPlaylistIdRef.current = null;
			pendingPersistRowsRef.current = null;

			dispatch(mediaPlaylistActions.resetUpdateMediaPlaylist());
			if (pid != null && rows != null) {
				void finishPersistSuccess(pid, rows);
			}
			else {
				setIsSavingMedia(false);
			}
			return;
		}

		if (updateOutcome.status === 'error') {
			updateRequestIdRef.current = null;
			pendingPersistPlaylistIdRef.current = null;
			pendingPersistRowsRef.current = null;

			dispatch(mediaPlaylistActions.resetUpdateMediaPlaylist());
			notification.showError(
				updateOutcome.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			setIsSavingMedia(false);
		}
	}, [dispatch, notification, translate, finishPersistSuccess, updateOutcome]);

	const handlePersist = useCallback(() => {
		void (async () => {
			const nameTrim = draftName.trim();
			const serverName = (playlist.name ?? '').trim();
			const nameChanged = nameTrim !== serverName;

			const replaceNow = playlistMediaRowsToReplaceItems(playlistMedia);
			const replaceSaved = playlistMediaRowsToReplaceItems(savedPlaylistMediaRef.current);
			const mediaChanged = !playlistReplacePayloadEqual(replaceNow, replaceSaved);

			if (!nameChanged && !mediaChanged) {
				notification.showInfo(
					translate('nikki.general.messages.no_changes'),
					translate('nikki.general.messages.success'),
				);
				return;
			}

			if (nameChanged && !nameTrim) {
				notification.showError(
					translate('coremart.vendingMachine.mediaPlaylist.messages.name_required'),
					translate('nikki.general.messages.error'),
				);
				return;
			}

			setIsSavingMedia(true);
			try {
				let etagSource = playlist;

				if (mediaChanged) {
					await mediaPlaylistService.replacePlaylistMedia(playlist.id, replaceNow);
					const afterMedia = await mediaPlaylistService.getMediaPlaylist(playlist.id);
					if (afterMedia) etagSource = afterMedia;
				}

				if (nameChanged) {
					pendingPersistPlaylistIdRef.current = playlist.id;
					pendingPersistRowsRef.current = clonePlaylistMediaRows(playlistMedia);
					const action = dispatch(
						mediaPlaylistActions.updateMediaPlaylist({
							id: etagSource.id,
							etag: etagSource.etag,
							updates: { name: nameTrim },
						}),
					);
					updateRequestIdRef.current = action.requestId ?? null;
					return;
				}

				await finishPersistSuccess(playlist.id, playlistMedia);
			}
			catch (e) {
				pendingPersistPlaylistIdRef.current = null;
				pendingPersistRowsRef.current = null;
				const message =
					e instanceof Error ? e.message : translate('nikki.general.errors.update_failed');
				notification.showError(message, translate('nikki.general.messages.error'));
				setIsSavingMedia(false);
			}
		})();
	}, [playlist, playlistMedia, draftName, dispatch, notification, translate, finishPersistSuccess]);

	const {
		isEditing,
		setIsEditing,
		formResetNonce,
		closeDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
	} = useMediaPlaylistSettingTab({
		playlist,
		onSave: handlePersist,
		isSubmitting: isSavingMedia,
	});

	useEffect(() => {
		setIsEditingRef.current = setIsEditing;
	}, [setIsEditing]);

	useEffect(() => {
		setDraftName(playlist.name ?? '');
	}, [playlist.id, playlist.name, formResetNonce]);

	useEffect(() => {
		let cancelled = false;
		mediaPlaylistService.loadPlaylistMediaRows(playlist.id, envVars.BASE_API_URL).then((rows) => {
			if (!cancelled) {
				setPlaylistMedia(rows);
				savedPlaylistMediaRef.current = clonePlaylistMediaRows(rows);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [playlist.id, envVars.BASE_API_URL]);

	useEffect(() => {
		setSelectedPreviewMediaId(null);
	}, [playlist.id]);

	useEffect(() => {
		if (selectedPreviewMediaId && !playlistMedia.some((m) => m.id === selectedPreviewMediaId)) {
			setSelectedPreviewMediaId(null);
		}
	}, [playlistMedia, selectedPreviewMediaId]);

	const handleAddMedia = () => {
		setGalleryModalOpened(true);
	};

	const handleSelectMedia = useCallback(
		async (selectedMedia: GalleryMedia[]) => {
			const built = await playlistRowsFromGallerySelection(selectedMedia, envVars.BASE_API_URL);
			setPlaylistMedia((prev) => {
				const start = prev.length;
				return [...prev, ...built.map((row, i) => ({ ...row, order: start + i + 1 }))];
			});
		},
		[envVars.BASE_API_URL],
	);

	const handleRemoveMedia = (mediaId: string) => {
		setPlaylistMedia(playlistMedia.filter((m) => m.id !== mediaId).map((m, index) => ({ ...m, order: index + 1 })));
	};

	const playlistMediaByOrder = useMemo(
		() => [...playlistMedia].sort((a, b) => a.order - b.order),
		[playlistMedia],
	);

	const firstPreviewUrl = playlistMediaByOrder[0]?.url;

	const handlePreviewMediaSelect = useCallback((row: PlaylistMediaRow) => {
		setSelectedPreviewMediaId(row.id);
		setStopTrialPlaybackSignal((s) => s + 1);
	}, []);

	const previewClip = useMemo(() => {
		if (mediaPlayState.activeMediaId) {
			const byActive = playlistMediaByOrder.find((m) => m.id === mediaPlayState.activeMediaId);
			if (byActive) return byActive;
		}

		if (selectedPreviewMediaId) {
			const found = playlistMediaByOrder.find((m) => m.id === selectedPreviewMediaId);
			if (found) return found;
		}

		return playlistMediaByOrder[0];
	}, [mediaPlayState.isPlaying, mediaPlayState.activeMediaId, selectedPreviewMediaId, playlistMediaByOrder]);

	const segmentOffsetSec = useMemo(() => {
		if (!mediaPlayState.activeMediaId) return 0;
		const idx = playlistMediaByOrder.findIndex((m) => m.id === mediaPlayState.activeMediaId);
		if (idx < 0) return 0;
		return playlistSegmentStartSec(idx, playlistMediaByOrder);
	}, [mediaPlayState.activeMediaId, playlistMediaByOrder]);

	const previewUrl = previewClip?.url ?? firstPreviewUrl;
	const previewMediaType: 'image' | 'video' = previewClip?.type ?? 'image';

	const readOnly = !isEditing;

	return (
		<>
			<Grid columns={12} gutter='md' align='flex-start'>
				<Grid.Col span={{ base: 12, md: 7 }}>
					<Stack px={0} bdrs='md' justify={'space-between'} h={{ base: 'max-content', md: 620 }} gap={'sm'}>
						<Stack gap={'sm'}>
							<Box>
								<TextInput
									label={translate('coremart.vendingMachine.mediaPlaylist.fields.name')}
									key={formResetNonce}
									value={draftName}
									onChange={(e) => setDraftName(e.currentTarget.value)}
									size='sm'
									readOnly={!isEditing}
								/>
							</Box>

							<MediaList
								maxHeight={350}
								readOnly={readOnly}
								media={playlistMedia}
								onAddMedia={handleAddMedia}
								onRemoveMedia={handleRemoveMedia}
								onMediaChange={setPlaylistMedia}

								onPreviewMediaSelect={handlePreviewMediaSelect}
								activePreviewMediaId={previewClip?.id ?? null}
							/>
						</Stack>
						<Divider />
						<PlaylistDurationTimeline
							readOnly={readOnly}
							previewLayout={previewLayout}
							setPreviewLayout={setPreviewLayout}
							mediaPlaylist={playlistMedia}
							onMediaChange={setPlaylistMedia}
							mediaPlayState={mediaPlayState}
							onPlaystateChange={mergePlayback}
							stopTrialPlaybackSignal={stopTrialPlaybackSignal}
						/>
					</Stack>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 5 }}>
					<Center h={{ base: 'auto', sm: 620 }} bg='gray.0' p={0}>
						{previewLayout === 'vertical' ? (
							<MediaPlaylistPreviewVertical
								playlist={playlist}
								imageUrl={previewUrl}
								mediaType={previewMediaType}
								mediaObjectFit={previewClip?.objectFit}
								segmentOffsetSec={segmentOffsetSec}
								mediaPlayState={mediaPlayState}
								applyPlayback={applyPlayback}
								onClipEnded={handleClipEnded}
							/>
						) : (
							<MediaPlaylistPreviewHorizontal
								playlist={playlist}
								imageUrl={previewUrl}
								mediaType={previewMediaType}
								mediaObjectFit={previewClip?.objectFit}
								segmentOffsetSec={segmentOffsetSec}
								mediaPlayState={mediaPlayState}
								applyPlayback={applyPlayback}
								onClipEnded={handleClipEnded}
							/>
						)}
					</Center>
				</Grid.Col>
			</Grid>

			<MediaGalleryModal
				opened={galleryModalOpened}
				onClose={() => setGalleryModalOpened(false)}
				onSelectMedia={handleSelectMedia}
				selectedMediaIds={playlistMedia.map((m) => m.kioskMediaRef)}
				baseApiUrl={envVars.BASE_API_URL}
			/>

			<MediaPlaylistDetailModals
				playlist={playlist}
				closeDeleteModal={closeDeleteModal}
				confirmDelete={confirmDelete}
				isOpenDeleteModal={isOpenDeleteModal}
				isOpenArchiveModal={isOpenArchiveModal}
				pendingArchive={pendingArchive}
				handleConfirmArchive={handleConfirmArchive}
				handleCloseArchiveModal={handleCloseArchiveModal}
			/>
		</>
	);
};
