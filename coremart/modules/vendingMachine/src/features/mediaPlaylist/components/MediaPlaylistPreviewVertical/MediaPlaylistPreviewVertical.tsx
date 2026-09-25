/* eslint-disable max-lines-per-function */
import { Box, Image, Stack, Text } from '@mantine/core';
import React, { useEffect, useRef } from 'react';

import { normalizePlaylistObjectFit, type ObjectFit, type Playlist, type PlaylistMediaPlayState } from '../../types';


export interface MediaPlaylistPreviewVerticalProps {
	playlist: Playlist;
	primaryColor?: string;
	imageUrl?: string;
	mediaType?: 'image' | 'video';
	mediaObjectFit?: ObjectFit | null;
	segmentOffsetSec: number;
	mediaPlayState: PlaylistMediaPlayState;
	/** Merge một phần trạng thái (video timeupdate / pause / seek); tránh gọi khi không đổi. */
	applyPlayback: (patch: Partial<PlaylistMediaPlayState>) => void;
	/** Hết một clip video — parent chuyển clip kế hoặc dừng. */
	onClipEnded: () => void;
}

const defaultPrimaryColor = '#1E90FF';

export const MediaPlaylistPreviewVertical: React.FC<MediaPlaylistPreviewVerticalProps> = ({
	playlist,
	primaryColor: themeColor = defaultPrimaryColor,
	imageUrl,
	mediaType = 'image',
	mediaObjectFit,
	segmentOffsetSec,
	mediaPlayState,
	applyPlayback,
	onClipEnded,
}) => {
	const fit = normalizePlaylistObjectFit(mediaObjectFit);
	const videoRef = useRef<HTMLVideoElement>(null);
	const prevPlayingRef = useRef<boolean | undefined>(undefined);
	const suppressPauseCallbackRef = useRef(false);

	const isActiveVideo =
		mediaType === 'video' && mediaPlayState.activeMediaId != null;

	useEffect(() => {
		const el = videoRef.current;
		if (!el || !isActiveVideo) return;

		const clipTarget = Math.max(0, mediaPlayState.playlistElapsedSec - segmentOffsetSec);
		if (Number.isFinite(el.duration) && el.duration > 0) {
			if (Math.abs(el.currentTime - clipTarget) > 0.35) {
				el.currentTime = Math.min(clipTarget, el.duration);
			}
		}

		if (mediaPlayState.isPlaying) {
			el.play().catch(() => {});
		}
		else if (prevPlayingRef.current === true) {
			suppressPauseCallbackRef.current = true;
			el.pause();
			queueMicrotask(() => {
				suppressPauseCallbackRef.current = false;
			});
		}
		prevPlayingRef.current = mediaPlayState.isPlaying;
	}, [
		isActiveVideo,
		imageUrl,
		mediaPlayState.isPlaying,
		mediaPlayState.playlistElapsedSec,
		segmentOffsetSec,
	]);

	return (
		<Box
			bg={`linear-gradient(180deg, ${themeColor}15 0%, #F0F8FF 100%)`}
			style={{
				aspectRatio: '9 / 16',
				width: 'auto',
				height: '100%',
				maxHeight: 700,
				position: 'relative',
				overflow: 'hidden',
				boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
			}}
		>
			{imageUrl && mediaType === 'video' ? (
				<video
					ref={videoRef}
					key={imageUrl}
					src={imageUrl}
					controls
					playsInline
					onTimeUpdate={() => {
						const el = videoRef.current;
						if (!el || !isActiveVideo) return;
						const playlistElapsed = segmentOffsetSec + el.currentTime;
						applyPlayback({
							playlistElapsedSec: playlistElapsed,
							clipElapsedSec: el.currentTime,
							isPlaying: !el.paused,
						});
					}}
					onSeeked={() => {
						const el = videoRef.current;
						if (!el || !isActiveVideo) return;
						const playlistElapsed = segmentOffsetSec + el.currentTime;
						applyPlayback({
							playlistElapsedSec: playlistElapsed,
							clipElapsedSec: el.currentTime,
						});
					}}
					onPause={() => {
						if (suppressPauseCallbackRef.current) return;
						const el = videoRef.current;
						if (!el || !isActiveVideo) return;
						applyPlayback({
							isPlaying: false,
							playlistElapsedSec: segmentOffsetSec + el.currentTime,
							clipElapsedSec: el.currentTime,
						});
					}}
					onEnded={() => {
						if (!isActiveVideo) return;
						onClipEnded();
					}}
					style={{
						width: '100%',
						height: '100%',
						objectFit: fit,
					}}
				/>
			) : imageUrl ? (
				<Image
					src={imageUrl}
					alt={playlist?.name}
					fit={fit}
					style={{
						width: '100%',
						height: '100%',
						objectFit: fit,
					}}
				/>
			) : (
				<Stack
					justify='center'
					align='center'
					gap='md'
					style={{
						width: '100%',
						height: '100%',
						padding: 40,
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					}}
				>
					<Text
						fw={700}
						size='xl'
						c='white'
						ta='center'
						style={{
							textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
						}}
					>
						{playlist?.name}
					</Text>
				</Stack>
			)}
		</Box>
	);
};
