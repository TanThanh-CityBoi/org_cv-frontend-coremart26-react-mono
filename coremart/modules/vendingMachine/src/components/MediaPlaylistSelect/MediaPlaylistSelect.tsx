import { Box, Text } from '@mantine/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Playlist } from '@/features/mediaPlaylist/types';

import {  MediaPlaylistCard } from './MediaPlaylistCard';
import { MediaPlaylistSelectModal } from './MediaPlaylistSelectModal';


export interface MediaPlaylistSelectProps {
	isEditing: boolean;
	type: 'waiting' | 'shopping';
	value: Playlist | null | undefined;
	onChange: (value: Playlist | undefined) => void;
	onRemove?: () => void;
}

export const MediaPlaylistSelect: React.FC<MediaPlaylistSelectProps> = ({
	isEditing,
	type,
	value,
	onChange,
	onRemove,
}) => {
	const { t: translate } = useTranslation();

	const [modalOpened, setModalOpened] = useState(false);

	const handleSelectPlaylists = (playlists: Playlist[]) => {
		if (playlists.length > 0) {
			onChange(playlists[0]);
		}
		setModalOpened(false);
	};

	return (
		<Box>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate(type === 'waiting'
					? 'coremart.vendingMachine.events.fields.idlePlaylist'
					: 'coremart.vendingMachine.events.fields.shoppingPlaylist')
				}
			</Text>
			<MediaPlaylistCard
				type={type}
				isEditing={isEditing}
				playlist={value}
				onSelect={() => setModalOpened(true)}
				onRemove={isEditing && onRemove ? onRemove : undefined}
			/>
			<MediaPlaylistSelectModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSelectPlaylists={handleSelectPlaylists}
			/>
		</Box>
	);
};
