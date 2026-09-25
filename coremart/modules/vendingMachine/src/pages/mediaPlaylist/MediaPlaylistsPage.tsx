import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hookhoc';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { asLegacyModelSchema } from '../../common/helpers';
import { ControlPanel, type ViewMode } from '../../components';
import { PageContainer } from '../../components/PageContainer';
import {
	MediaPlaylistDetailDrawer,
	MediaPlaylistGridView,
	MediaPlaylistTable,
	type MediaPlaylistTableActions,
	mediaPlaylistSchema,
	useMediaPlaylistDetail,
	useMediaPlaylistFilter,
	useMediaPlaylistList,
	usePlaylistArchive,
} from '../../features/mediaPlaylist';
import { mediaPlaylistCrudService } from '../../features/mediaPlaylist/mediaPlaylistCrudService';

import type { Playlist } from '../../features/mediaPlaylist/types';



// eslint-disable-next-line max-lines-per-function
export const MediaPlaylistsPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();
	const { dispatchMethod: deletePlaylist } = useServiceLayer(mediaPlaylistCrudService.delete);
	const { filters, graph } = useMediaPlaylistFilter();
	const { playlists, isLoadingList, handleRefresh, pagination } = useMediaPlaylistList({ graph });
	const archive = usePlaylistArchive({ onArchiveSuccess: handleRefresh });
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Playlist>();

	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | undefined>();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const { playlist: selectedPlaylist, isLoading: isLoadingDetail } = useMediaPlaylistDetail(selectedPlaylistId);

	const tableRows = useMemo(
		() =>
			(playlists || []).map((p: Playlist) => ({
				...p,
				mediaItems: p.mediaItems ?? null,
			})) as unknown as Record<string, unknown>[],
		[playlists],
	);

	const handlePreview = (playlist: Playlist) => {
		setSelectedPlaylistId(playlist.id);
		setDrawerOpened(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpened(false);
		setSelectedPlaylistId(undefined);
	};

	const handleOpenDeleteModal = (playlistId: string) => {
		const playlist = playlists?.find((p: Playlist) => p.id === playlistId);
		if (playlist) {
			configOpenModal(playlist);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) {
			void deletePlaylist({ id: item.id }).then(() => {
				handleRefresh();
			});
		}
		handleCloseModal();
	};

	const handleCreate = () => {
		navigate('create');
	};

	const handleViewDetail = (playlist: Playlist) => {
		navigate(`../media-playlist/playlists/${playlist.id}`);
	};

	const playlistTableActions: MediaPlaylistTableActions = {
		preview: handlePreview,
		viewDetail: handleViewDetail,
		archive: archive.handleOpenArchiveModal,
		restore: archive.handleOpenRestoreModal,
		delete: (p) => handleOpenDeleteModal(p.id),
	};

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('media_playlist.title'), href: '#' },
	], [translate]);

	return (
		<>
			<PageContainer
				documentTitle={translate('media_playlist.title')}
				breadcrumbs={breadcrumbs}
				actionBar={
					<ControlPanel
						actions={[
							{ label: translate('action.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
							{ label: translate('action.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' },
						]}
						filters={filters}
						viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
					/>
				}
			>
				{viewMode === 'list' ? (
					<MediaPlaylistTable
						columns={['name', 'isArchived', 'mediaItems', 'actions']}
						data={tableRows}
						schema={asLegacyModelSchema(mediaPlaylistSchema)}
						isLoading={isLoadingList}
						actions={playlistTableActions}
						pagination={pagination}
					/>
				) : (
					<MediaPlaylistGridView
						playlists={playlists || []}
						isLoading={isLoadingList}
						actions={playlistTableActions}
						pagination={pagination}
					/>
				)}
			</PageContainer>

			<ConfirmModal
				opened={isOpen}
				onClose={handleCloseModal}
				onConfirm={handleDeleteConfirm}
				title={translate('messages.delete.confirm')}
				message={
					item
						? translate('messages.delete.confirm.name', { name: item.name })
						: translate('messages.delete.confirm')
				}
				confirmLabel={translate('action.delete')}
				confirmColor='red'
			/>

			<ConfirmModal
				opened={!!archive.pendingArchive && archive.isOpenArchiveModal}
				onClose={archive.handleCloseModal}
				onConfirm={archive.handleConfirmArchive}
				title={archive.pendingArchive?.targetArchived
					? translate('media_playlist.messages.archive_modal_title')
					: translate('media_playlist.messages.restore_modal_title')}
				message={
					<Trans
						i18nKey={archive.pendingArchive?.targetArchived
							? 'media_playlist.messages.archive_confirm'
							: 'media_playlist.messages.restore_confirm'}
						values={{ name: archive.pendingArchive?.playlist?.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={archive.pendingArchive?.targetArchived
					? translate('action.archive')
					: translate('action.restore')}
				confirmColor={archive.pendingArchive?.targetArchived ? 'orange' : 'blue'}
			/>

			<MediaPlaylistDetailDrawer
				opened={drawerOpened}
				onClose={handleCloseDrawer}
				playlist={selectedPlaylist}
				isLoading={isLoadingDetail}
			/>
		</>
	);
};
