/* eslint-disable max-lines-per-function */
import { Button, Card, Group, Modal, ScrollArea, SimpleGrid, Space, Stack, Text, TextInput } from '@mantine/core';
import { IconPlaylist, IconSearch, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TablePagination } from '@/components/Table';
import {
	useMediaPlaylistFilter,
	useMediaPlaylistList,
} from '@/features/mediaPlaylist/hooks';

import { ArchivedStatusBadge } from '../ArchivedStatusBadge';

import type { Playlist } from '@/features/mediaPlaylist/types';


export interface MediaPlaylistSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectPlaylists: (playlists: Playlist[]) => void;
	selectedPlaylistIds?: string[];
}

export const MediaPlaylistSelectModal: React.FC<MediaPlaylistSelectModalProps> = ({
	opened,
	onClose,
	onSelectPlaylists,
}) => {
	const { t: translate } = useTranslation();
	const { filters, graph } = useMediaPlaylistFilter();
	const {
		playlists,
		isLoadingList,
		pagination,
		listError,
	} = useMediaPlaylistList({ graph, enabled: opened });
	const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);

	const searchFilter = filters.find((f) => f.key === 'search');
	const { value: searchValue, onChange: setSearchValue } = searchFilter ?? {};

	const handleTogglePlaylist = (playlist: Playlist) => {
		setSelectedPlaylists([playlist]);
	};

	const handleConfirm = () => {
		onSelectPlaylists(selectedPlaylists);
		setSelectedPlaylists([]);
		setSearchValue?.('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedPlaylists([]);
		setSearchValue?.('');
		onClose();
	};

	const rows = playlists ?? [];
	const showEmpty = !isLoadingList && !listError && rows.length === 0;

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('coremart.vendingMachine.mediaPlaylist.selectPlaylists.title')}
			size='xl'
		>
			<Stack gap='md'>
				<TextInput
					placeholder={searchFilter?.placeholder}
					leftSection={<IconSearch size={16} />}
					rightSection={
						searchValue ? <IconX size={16} onClick={() => setSearchValue?.('')} /> : <></>
					}
					value={searchValue}
					onChange={(e) => setSearchValue?.(e.currentTarget.value)}
				/>

				{listError ? (
					<Text size='sm' c='red'>{listError}</Text>
				) : null}

				{selectedPlaylists.length > 0 ? (
					<Text size='sm' c='blue' fw={500}>
						{translate('coremart.vendingMachine.mediaPlaylist.selectPlaylists.selectedCount',
							{ count: selectedPlaylists.length })}
					</Text>
				) : null}

				<ScrollArea h={400}>
					{isLoadingList ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.general.messages.loading')}
						</Text>
					) : showEmpty ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('coremart.vendingMachine.mediaPlaylist.messages.no_playlists_found')}
						</Text>
					) : (
						<SimpleGrid cols={2} spacing='md'>
							{rows.map((playlist: Playlist) => {
								const isSelected = selectedPlaylists.some((a) => a.id === playlist.id);
								return (
									<Card
										key={playlist.id}
										withBorder
										p='sm'
										radius='md'
										style={{
											cursor: 'pointer',
											borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
											backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
										}}
										onClick={() => handleTogglePlaylist(playlist)}
									>
										<Stack gap='sm'>
											<Group gap='sm'>
												<IconPlaylist size={50} stroke={1} />
												<Stack gap={'xs'}>
													<Text fw={600} size='sm'>{playlist.name}</Text>
													<ArchivedStatusBadge size='xs' isArchived={!!playlist.isArchived} />
												</Stack>
											</Group>

											<Text size='xs' c='dimmed'>
												{translate('coremart.vendingMachine.mediaPlaylist.fields.createdAt')}: {new Date(playlist.createdAt).toLocaleDateString()}
											</Text>
										</Stack>
									</Card>
								);
							})}
						</SimpleGrid>
					)}
				</ScrollArea>

				<TablePagination {...pagination} />

				<Space h='sm' />

				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={selectedPlaylists.length === 0}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
