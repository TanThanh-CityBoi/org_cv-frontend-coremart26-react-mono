import { ActionIcon, Badge, Button, Card, Group, Stack, Tooltip, Text, Center, Box } from '@mantine/core';
import { IconEye, IconPlaylist, IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { TextLink } from '../Text';

import type { Playlist } from '@/features/mediaPlaylist/types';


export interface MediaPlaylistCardProps {
	type: 'waiting' | 'shopping';
	isEditing?: boolean;
	playlist?: Playlist | null;
	onSelect?: () => void;
	onRemove?: () => void;
}


const EmptyPlaylistCardContent: React.FC<{
	type: 'waiting' | 'shopping';
	isEditing: boolean;
	onSelect: () => void;
}> = ({type, isEditing, onSelect}) => {
	const { t: translate } = useTranslation();

	return (
		<Group gap='xs' justify='space-between'>
			<Group gap='xs' align='start'>
				<IconPlaylist size={30} color='var(--mantine-color-gray-7)' />
				<Text size='sm' c='dimmed'>
					{translate(type === 'waiting'
						? 'coremart.vendingMachine.events.messages.no_idle_playlist'
						: 'coremart.vendingMachine.events.messages.no_shopping_playlist')}
				</Text>
			</Group>
			{isEditing && (
				<Button
					size='xs'
					leftSection={<IconPlus size={14} />}
					onClick={onSelect}
				>
					{translate('coremart.vendingMachine.events.playlist.selectMediaPlaylists')}
				</Button>
			)}
		</Group>
	);
};

const MediaPlaylistCardContent: React.FC<{
	playlist: Playlist;
	isEditing: boolean;
	onRemove?: () => void;
}> = ({ playlist, isEditing, onRemove }) => {
	const { t: translate } = useTranslation();
	const archived = !!playlist.isArchived;
	const detailLabel = translate('nikki.general.actions.viewDetail');

	return (
		<Group gap='xs' align='top' justify='space-between'>
			<Group align='flex-start'>
				<Center p={'xs'} bg={'gray.0'} bdrs={'sm'}>
					<IconPlaylist size={30} color='var(--mantine-color-gray-7)' />
				</Center>
				<Stack gap={0}>
					<TextLink to={`../media-playlist/playlists/${playlist.id}`} mb={6}>
						{playlist.name}
					</TextLink>
					<Text size='xs' c='dimmed' lineClamp={1} mb={'xs'}>{playlist.id}</Text>
					<Badge size='sm' variant='filled' color={archived ? 'gray' : 'green'}>
						{archived
							? translate('coremart.vendingMachine.mediaPlaylist.archived.yes')
							: translate('coremart.vendingMachine.mediaPlaylist.archived.no')}
					</Badge>
				</Stack>
			</Group>

			<Box>
				{playlist.id ? (
					<Tooltip label={detailLabel}>
						<ActionIcon
							variant='subtle'
							color='blue'
							size='sm'
							aria-label={detailLabel}
							component={Link}
							to={`../media-playlist/playlists/${playlist.id}`}
						>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				) : null}
				{isEditing && onRemove ? (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' size='sm' onClick={onRemove}>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				) : null}
			</Box>
		</Group>
	);
};



export const MediaPlaylistCard: React.FC<MediaPlaylistCardProps> = ({
	type, isEditing = false, playlist, onSelect = () => {}, onRemove,
}) => {
	return (
		<Card key={playlist?.id ?? 'empty'} withBorder p='sm' radius='md'>
			{
				playlist
					? <MediaPlaylistCardContent playlist={playlist} isEditing={isEditing} onRemove={onRemove} />
					: <EmptyPlaylistCardContent type={type} isEditing={isEditing} onSelect={onSelect} />
			}
		</Card>
	);
};
