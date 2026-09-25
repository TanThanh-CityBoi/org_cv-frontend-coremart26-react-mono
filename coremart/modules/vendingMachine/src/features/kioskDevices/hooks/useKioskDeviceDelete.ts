import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskDeviceStoreService } from '../kioskDeviceStoreService';
import { KioskDevice } from '../types';


export const useKioskDeviceDelete = () => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [deviceToDelete, setDeviceToDelete] = React.useState<KioskDevice | null>(null);

	const { dispatchMethod, result } = useServiceLayer(kioskDeviceStoreService.delete);

	const handleOpenDeleteModal = React.useCallback((kioskDevice: KioskDevice) => {
		setDeviceToDelete(kioskDevice);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setDeviceToDelete(null);
	}, []);

	const handleDelete = React.useCallback((deviceId: string) => {
		dispatchMethod({ id: deviceId });
	}, [dispatchMethod]);

	// Notification only — the original hook left the modal open and the list untouched too.
	useMutationOutcome(result, {
		successKey: () => 'device.messages.delete_success',
		errorKey: 'errors.deleteFailed',
	});

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		deviceToDelete,
	};
};
