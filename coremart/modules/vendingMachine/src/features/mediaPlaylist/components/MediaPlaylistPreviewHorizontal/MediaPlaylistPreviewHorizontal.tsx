/* eslint-disable max-lines-per-function */
import { Badge, Box, Button, Card, Center, Group, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import React, { useEffect, useRef } from 'react';

import { normalizePlaylistObjectFit, type ObjectFit, type Playlist, type PlaylistMediaPlayState } from '../../types';


export interface MediaPlaylistPreviewHorizontalProps {
	playlist: Playlist;
	primaryColor?: string;
	imageUrl?: string;
	mediaType?: 'image' | 'video';
	mediaObjectFit?: ObjectFit | null;
	segmentOffsetSec: number;
	mediaPlayState: PlaylistMediaPlayState;
	applyPlayback: (patch: Partial<PlaylistMediaPlayState>) => void;
	onClipEnded: () => void;
}

const mockProducts = [
	{ id: '1', name: 'Aquafina', price: '11.000 ₫', stock: 29, image: 'https://via.placeholder.com/150' },
	{ id: '2', name: 'Revive Chanh Muối', price: '15.000 ₫', stock: 15, image: 'https://via.placeholder.com/150' },
	{ id: '3', name: 'NutriBoost Orange', price: '20.000 ₫', stock: 8, image: 'https://via.placeholder.com/150' },
	{ id: '4', name: 'Sting Energy', price: '12.000 ₫', stock: 22, image: 'https://via.placeholder.com/150' },
	{ id: '5', name: 'Aquafina', price: '11.000 ₫', stock: 29, image: 'https://via.placeholder.com/150' },
	{ id: '6', name: 'Revive Chanh Muối', price: '15.000 ₫', stock: 15, image: 'https://via.placeholder.com/150' },
	{ id: '7', name: 'NutriBoost Orange', price: '20.000 ₫', stock: 8, image: 'https://via.placeholder.com/150' },
	{ id: '8', name: 'Sting Energy', price: '12.000 ₫', stock: 22, image: 'https://via.placeholder.com/150' },
	{ id: '9', name: 'Aquafina', price: '11.000 ₫', stock: 29, image: 'https://via.placeholder.com/150' },
	{ id: '10', name: 'Revive Chanh Muối', price: '15.000 ₫', stock: 15, image: 'https://via.placeholder.com/150' },
	{ id: '11', name: 'NutriBoost Orange', price: '20.000 ₫', stock: 8, image: 'https://via.placeholder.com/150' },
	{ id: '12', name: 'Sting Energy', price: '12.000 ₫', stock: 22, image: 'https://via.placeholder.com/150' },
];

const defaultPrimaryColor = '#1E90FF';

export const MediaPlaylistPreviewHorizontal: React.FC<MediaPlaylistPreviewHorizontalProps> = ({
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
	const prevTrialRef = useRef<boolean | undefined>(undefined);
	const suppressPauseCallbackRef = useRef(false);

	const isActiveVideo = mediaType === 'video' && mediaPlayState.activeMediaId != null;

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
		else if (prevTrialRef.current === true) {
			suppressPauseCallbackRef.current = true;
			el.pause();
			queueMicrotask(() => {
				suppressPauseCallbackRef.current = false;
			});
		}
		prevTrialRef.current = mediaPlayState.isPlaying;
	}, [
		isActiveVideo,
		imageUrl,
		mediaPlayState.isPlaying,
		mediaPlayState.playlistElapsedSec,
		segmentOffsetSec,
	]);

	return (
		<Stack
			mah={700}
			h='100%'
			w='auto'
			justify='space-between'
			gap={0}
			style={{
				aspectRatio: '9 / 16',
				boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
			}}
			bg={`linear-gradient(180deg, ${themeColor}15 0%, #F0F8FF 100%)`}
		>
			{/* Header */}
			<Center
				style={{
					backgroundColor: themeColor,
				}}
				py={6} px={10}
				h={36}
				pos='relative'
			>

				<Group gap={6} align='end'>
					<Title
						c='orange.3'
						size='lg'
						style={{
							lineHeight: 1,
						}}
					>
						Core+ Mart
					</Title>
					<Badge size='xs' variant='filled' color='blue'>Mini</Badge>
				</Group>
				<Group gap='xs' pos='absolute' right={10} top={6}>
					<Box
						style={{
							width: 24,
							height: 24,
							borderRadius: '50%',
							backgroundColor: 'rgba(255,255,255,0.2)',
							cursor: 'pointer',
						}}
					/>
					<Box
						style={{
							width: 24,
							height: 24,
							borderRadius: '50%',
							backgroundColor: 'rgba(255,255,255,0.2)',
							cursor: 'pointer',
						}}
					/>
				</Group>
			</Center>

			{/* Categories */}
			<Group gap='xs' wrap='nowrap' style={{ overflow: 'hidden' }} px={'xs'} pt={6}>
				<Button size='compact-xs' bg={themeColor} c='white' bdrs={'lg'}>Tất Cả</Button>
				<Button
					variant='outline'
					size='compact-xs'
					c={themeColor}
					style={{ borderColor: themeColor}}
					bdrs={'lg'}
				>
					Dừa
				</Button>
				<Button
					variant='outline'
					size='compact-xs'
					c={themeColor}
					style={{ borderColor: themeColor}}
					bdrs={'lg'}
				>
					Nước Tinh Khiết
				</Button>
				<Button
					variant='outline'
					size='compact-xs'
					c={themeColor}
					style={{ borderColor: themeColor}}
					bdrs={'lg'}
				>
					Trà
				</Button>
			</Group>

			{/* Products Grid */}
			<SimpleGrid cols={4} spacing={6} py={6} px={6} flex={1} style={{ overflowY: 'auto' }}>
				{mockProducts.map((product) => (
					<Card
						w={'100%'}
						key={product.id}
						shadow='sm'
						p={{ base: 2, md: 4 }}
						radius='md'
						withBorder
						style={{
							backgroundColor: 'white',
							borderRadius: 8,
							aspectRatio: '4 / 5',
						}}
					>
						<Stack gap={0}>
							<Image
								src={product.image}
								alt={''}
								h={45}
								mb={4}
								fit='contain'
							/>
							<Text style={{ fontSize: 9, lineHeight: 1.2 }} lineClamp={1}>
								{product?.name}
							</Text>
							<Text
								fw={600}
								style={{ fontSize: 9, lineHeight: 1.2 }}
								c={'blue.5'}
							>
								{product?.price}
							</Text>
							<Text style={{ fontSize: 8, lineHeight: 1 }} c='dimmed' mb={2}>
								Còn lại: {product?.stock}
							</Text>
							<Group gap={4}>
								{[2, 3, 4].map((qty) => (
									<Button
										key={qty}
										size='compact-xs'
										p={2} h={12} w={12}
										bdrs={'50%'}
										style={{ fontSize: 9, lineHeight: 1.2 }}
										color='orange'
									>
										{qty}
									</Button>
								))}
							</Group>
						</Stack>
					</Card>
				))}
			</SimpleGrid>

			{/* Footer with Playlist (replacing mascot/branding) */}
			<Box
				p={0}
				w='100%'
				style={{
					position: 'relative',
					backgroundColor: `${themeColor}30`,
					aspectRatio: '1080 / 605',
				}}
			>
				{imageUrl && mediaType === 'video' ? (
					<video
						ref={videoRef}
						key={imageUrl}
						src={imageUrl}
						controls
						muted
						playsInline
						onTimeUpdate={() => {
							const el = videoRef.current;
							if (!el || !isActiveVideo) return;
							applyPlayback({
								playlistElapsedSec: segmentOffsetSec + el.currentTime,
								clipElapsedSec: el.currentTime,
								isPlaying: !el.paused,
							});
						}}
						onSeeked={() => {
							const el = videoRef.current;
							if (!el || !isActiveVideo) return;
							applyPlayback({
								playlistElapsedSec: segmentOffsetSec + el.currentTime,
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
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
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
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							// minHeight: 120,
							objectFit: fit,
						}}
					/>
				) : (
					<Stack
						justify='center'
						align='center'
						gap='xs'
						style={{
							width: '100%',
							height: '100%',
							minHeight: 300,
							padding: 20,
							background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}80 100%)`,
						}}
					>
						<Text
							fw={700}
							size='lg'
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
		</Stack>
	);
};
