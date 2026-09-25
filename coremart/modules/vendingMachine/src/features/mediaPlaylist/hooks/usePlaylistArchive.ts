import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { mediaPlaylistCrudService } from '../mediaPlaylistCrudService';

import type { Playlist } from '../types';


export interface UsePlaylistArchiveProps {
	onArchiveSuccess?: () => void;
	onArchiveError?: () => void;
}

type PendingArchive = { playlist: Playlist, targetArchived: boolean };


export const usePlaylistArchive = ({
	onArchiveSuccess = () => {},
	onArchiveError = () => {},
}: UsePlaylistArchiveProps = {
	onArchiveSuccess: () => {},
	onArchiveError: () => {},
}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');

	const { dispatchMethod, result } = useServiceLayer(mediaPlaylistCrudService.setIsArchived);
	// Which direction the in-flight call was, since the response body does not say.
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);

	const [pendingArchive, setPendingArchive] = React.useState<PendingArchive | null>(null);

	const handleCloseModal = React.useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleOpenArchiveModal = React.useCallback((playlistItem: Playlist) => {
		setPendingArchive({ playlist: playlistItem, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = React.useCallback((playlistItem: Playlist) => {
		setPendingArchive({ playlist: playlistItem, targetArchived: false });
	}, []);

	const handleConfirmArchive = React.useCallback(() => {
		if (!pendingArchive?.playlist.etag) {
			notification.showError(
				translate('errors.updateFailed'),
				translate('messages.error'),
			);
			return;
		}
		const { id, etag } = pendingArchive.playlist;
		const { targetArchived } = pendingArchive;
		pendingTargetArchivedRef.current = targetArchived;
		dispatchMethod({ id, etag, is_archived: targetArchived });
	}, [dispatchMethod, notification, pendingArchive, translate]);

	useMutationOutcome(result, {
		successKey: () => (pendingTargetArchivedRef.current === true
			? 'media_playlist.messages.archive_success'
			: 'media_playlist.messages.restore_success'),
		errorKey: 'errors.updateFailed',
		onSuccess: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onArchiveSuccess(); },
		onError: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onArchiveError(); },
	});

	return {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal,
		isOpenArchiveModal: pendingArchive != null,
		pendingArchive,
	};
};
