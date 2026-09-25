import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskSettingCrudService } from '../kioskSettingService';
import { type KioskSetting } from '../types';


export const useKioskSettingDelete = (onRefresh?: () => void) => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [settingToDelete, setSettingToDelete] = React.useState<KioskSetting | null>(null);

	const { dispatchMethod, result } = useServiceLayer(kioskSettingCrudService.delete);

	const handleOpenDeleteModal = (setting: KioskSetting) => {
		setSettingToDelete(setting);
		setIsOpenDeleteModal(true);
	};
	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setSettingToDelete(null);
	}, []);

	const handleDelete = React.useCallback((settingId: string) => {
		dispatchMethod({ id: settingId });
	}, [dispatchMethod]);

	// Note: the modal closes on success only — an error leaves it open, as before.
	useMutationOutcome(result, {
		successKey: () => 'messages.delete.success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { handleCloseDeleteModal(); onRefresh?.(); },
	});

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		settingToDelete,
	};
};
