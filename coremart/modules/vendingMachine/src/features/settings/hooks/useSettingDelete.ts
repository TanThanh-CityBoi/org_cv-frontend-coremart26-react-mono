import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { settingStoreService } from '../settingStoreService';
import { Setting } from '../types';


export interface UseSettingDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}

export const useSettingDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UseSettingDeleteProps = {}) => {
	const { dispatchMethod, result } = useServiceLayer(settingStoreService.delete);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [settingToDelete, setSettingToDelete] = React.useState<Setting | null>(null);

	const handleOpenDeleteModal = React.useCallback((setting: Setting) => {
		setSettingToDelete(setting);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setSettingToDelete(null);
	}, []);

	const handleDelete = React.useCallback(() => {
		if (!settingToDelete) return;
		dispatchMethod({ id: settingToDelete.id });
	}, [dispatchMethod, settingToDelete]);

	// The slice re-dispatched `listSettings` here. Delete and list now hold separate service-layer
	// results, so refreshing the list is the caller's job — that is what `onDeleteSuccess` is for.
	useMutationOutcome(result, {
		successKey: () => 'settings.messages.delete_success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { handleCloseDeleteModal(); onDeleteSuccess(); },
		onError: () => { handleCloseDeleteModal(); onDeleteError(); },
	});

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		settingToDelete,
	};
};
