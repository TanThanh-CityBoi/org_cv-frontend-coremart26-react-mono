import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { mediaPlaylistCrudService } from '../mediaPlaylistCrudService';

import type { Playlist } from '../types';


export interface UsePlaylistDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}


export const usePlaylistDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UsePlaylistDeleteProps = {
	onDeleteSuccess: () => {},
	onDeleteError: () => {},
}) => {
	const { dispatchMethod, result } = useServiceLayer(mediaPlaylistCrudService.delete);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [playlistToDelete, setPlaylistToDelete] = React.useState<Playlist | null>(null);

	const handleOpenDeleteModal = React.useCallback((playlistItem: Playlist) => {
		setPlaylistToDelete(playlistItem);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setPlaylistToDelete(null);
	}, []);

	const handleDelete = React.useCallback((playlistId: string) => {
		dispatchMethod({ id: playlistId });
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'media_playlist.messages.delete_success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { handleCloseDeleteModal(); onDeleteSuccess(); },
		onError: () => { handleCloseDeleteModal(); onDeleteError(); },
	});

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		playlistToDelete,
	};
};
