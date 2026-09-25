import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskCrudService } from '../kioskService';
import { type Kiosk } from '../types';


export const useKioskDelete = ({ onSuccess = () => {} }: { onSuccess: () => void }) => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [kioskToDelete, setKioskToDelete] = React.useState<Kiosk | null>(null);

	const { dispatchMethod, result } = useServiceLayer(kioskCrudService.delete);

	const openDeleteModal = React.useCallback((kiosk: Kiosk) => {
		setKioskToDelete(kiosk);
		setIsOpenDeleteModal(true);
	}, []);

	const closeDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setKioskToDelete(null);
	}, []);

	const handleDelete = React.useCallback(() => {
		if (!kioskToDelete) return;
		dispatchMethod({ id: kioskToDelete.id });
	}, [dispatchMethod, kioskToDelete]);

	useMutationOutcome(result, {
		successKey: () => 'kiosk.messages.delete_success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { closeDeleteModal(); onSuccess(); },
	});

	return {
		handleDelete,
		openDeleteModal,
		closeDeleteModal,
		isOpenDeleteModal,
		kioskToDelete,
	};
};
