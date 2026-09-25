import { Box, Divider, Stack, Text } from '@mantine/core';
import { useShellEnvVars } from '@nikkierp/shell/config';
import { IconPlaylist } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { PreviewDrawer } from '../../../../components/PreviewDrawer';
import { mediaPlaylistService } from '../../mediaPlaylistService';
import { type Playlist, type PlaylistMediaRow } from '../../types';
import { MediaList } from '../MediaList';


export interface MediaPlaylistDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	playlist: Playlist | undefined;
	isLoading?: boolean;
}


export const MediaPlaylistDetailDrawer: React.FC<MediaPlaylistDetailDrawerProps> = ({
	opened,
	onClose,
	playlist,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();
	const [playlistMedia, setPlaylistMedia] = useState<PlaylistMediaRow[]>([]);

	const envVars = useShellEnvVars();

	React.useEffect(() => {
		if (!playlist?.id) {
			setPlaylistMedia([]);
			return;
		}
		let cancelled = false;
		mediaPlaylistService.loadPlaylistMediaRows(playlist.id, envVars.BASE_API_URL).then((rows) => {
			if (!cancelled) setPlaylistMedia(rows);
		});
		return () => {
			cancelled = true;
		};
	}, [playlist?.id]);

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: playlist?.name,
				subtitle: <ArchivedStatusBadge isArchived={!!playlist?.isArchived} />,
				avatar: <IconPlaylist size={30} />,
			}}
			onViewDetails={() => {
				if (playlist?.id) {
					navigate(`../media-playlist/playlists/${playlist.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!playlist && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			<Stack gap='sm'>
				<Box>
					<Text size='sm' c='dimmed' mb={3}>
						{translate('media_playlist.fields.name')}
					</Text>
					<Text size='sm' fw={500}>{playlist?.name}</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb={3}>
						{translate('media_playlist.fields.created_at')}
					</Text>
					<Text size='sm'>{playlist?.createdAt ? new Date(playlist.createdAt).toLocaleString() : '—'}</Text>
				</Box>

				<Divider my={'lg'} />

				<MediaList
					maxHeight={350}
					readOnly={true}
					media={playlistMedia}
					onAddMedia={() => {}}
					onRemoveMedia={() => {}}
					onMediaChange={setPlaylistMedia}
				/>
			</Stack>
		</PreviewDrawer>
	);
};
