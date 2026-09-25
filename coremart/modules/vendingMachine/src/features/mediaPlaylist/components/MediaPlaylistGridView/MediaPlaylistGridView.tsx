import { Avatar, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconPhoto, IconPlaylist, IconVideo } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CardActionMenu } from '@/components';
import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { TablePagination } from '@/components/Table';
import { type TablePaginationProps } from '@/components/Table';

import { type Playlist } from '../../types';
import { getMediaPlaylistTableActions, type MediaPlaylistTableActions } from '../MediaPlaylistTable';


export interface MediaPlaylistGridViewProps {
	playlists: Playlist[];
	isLoading?: boolean;
	actions: MediaPlaylistTableActions;
	pagination?: TablePaginationProps;
}

type MediaPlaylistGridCardProps = {
	playlist: Playlist;
	cardActions: MediaPlaylistTableActions;
	onClick?: (playlist: Playlist) => void;
	translate: TFunction;
};

function MediaPlaylistGridCard({ playlist, cardActions, onClick, translate }: MediaPlaylistGridCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	//** Fake media items icon */
	const mediaItems = useMemo(() => {
		return (new Array(5).fill(0).map((_, index) => (
			<Avatar key={index} size='sm' radius={'xs'}>
				{
					Math.random() > 0.5 ? (
						<IconPhoto size={18} stroke={1} />
					) : (
						<IconVideo size={18} stroke={1} />
					)
				}
			</Avatar>
		)));
	}, [playlist.id]);

	return (
		<Card
			ref={cardRef}
			shadow='sm'
			padding='lg'
			radius='md'
			withBorder
			pos='relative'
			style={{
				cursor: 'pointer',
			}}
			onClick={() => onClick?.(playlist)}
		>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='sm'>
						<IconPlaylist size={40} stroke={1} />
						<Stack gap={'xs'}>
							<Text fw={600} size='sm'>{playlist.name}</Text>
							<ArchivedStatusBadge size='xs' isArchived={!!playlist.isArchived} />
						</Stack>
					</Group>
					<Group gap='xs' onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}>
						<CardActionMenu
							items={getMediaPlaylistTableActions(playlist, cardActions, translate)}
							contextMenuContainerRef={cardRef}
						/>
					</Group>
				</Group>

				<Group gap={4} wrap='nowrap'>
					{mediaItems}
				</Group>

				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.mediaPlaylist.fields.createdAt')}: {new Date(playlist.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
}

export const MediaPlaylistGridView: React.FC<MediaPlaylistGridViewProps> = ({
	playlists,
	isLoading = false,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation();
	const { preview: _onPreview, viewDetail, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (playlists.length === 0) {
		return <Text c='dimmed'>{translate('coremart.vendingMachine.mediaPlaylist.messages.no_playlists_found')}</Text>;
	}

	return (
		<Stack gap='md' pos='relative' mih={150}>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing={{ base: 'sm', sm: 'md' }}
			>
				{playlists.map((playlist) => (
					<MediaPlaylistGridCard
						key={playlist.id}
						playlist={playlist}
						cardActions={cardActions}
						onClick={viewDetail}
						translate={translate}
					/>
				))}
			</SimpleGrid>
			{pagination ? <TablePagination {...pagination} /> : null}
		</Stack>
	);
};
