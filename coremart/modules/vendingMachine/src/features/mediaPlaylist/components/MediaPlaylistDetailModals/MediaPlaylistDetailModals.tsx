import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { Playlist } from '../../types';


export type MediaPlaylistDetailModalsProps = {
	playlist: Playlist,
	closeDeleteModal: () => void,
	confirmDelete: () => void,
	isOpenDeleteModal: boolean,
	isOpenArchiveModal: boolean,
	pendingArchive: { playlist: Playlist, targetArchived: boolean } | null,
	handleConfirmArchive: () => void,
	handleCloseArchiveModal: () => void,
};

export const MediaPlaylistDetailModals: React.FC<MediaPlaylistDetailModalsProps> = ({
	playlist,
	closeDeleteModal,
	confirmDelete,
	isOpenDeleteModal,
	isOpenArchiveModal,
	pendingArchive,
	handleConfirmArchive,
	handleCloseArchiveModal,
}) => {
	const { t } = useTranslation('vending_machine');

	return (
		<>
			<ConfirmModal
				title={t('messages.delete.confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={
					<Trans
						i18nKey='media_playlist.messages.delete_confirm'
						values={{ name: playlist.name }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={t('action.delete')}
				confirmColor='red'
			/>

			<ConfirmModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				title={pendingArchive?.targetArchived
					? t('media_playlist.messages.archive_modal_title')
					: t('media_playlist.messages.restore_modal_title')}
				message={
					<Trans
						i18nKey={pendingArchive?.targetArchived
							? 'media_playlist.messages.archive_confirm'
							: 'media_playlist.messages.restore_confirm'}
						values={{ name: pendingArchive?.playlist?.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={pendingArchive?.targetArchived
					? t('action.archive')
					: t('action.restore')}
				confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
			/>
		</>
	);
};
