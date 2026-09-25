import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskModelCrudService } from '../kioskModelService';
import { KioskModel } from '../types';


export interface UseKioskModelDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}


export const useKioskModelDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UseKioskModelDeleteProps = {
	onDeleteSuccess: () => {},
	onDeleteError: () => {},
}) => {
	const { dispatchMethod, result } = useServiceLayer(kioskModelCrudService.delete);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [modelToDelete, setModelToDelete] = React.useState<KioskModel | null>(null);

	const handleOpenDeleteModal = React.useCallback((kioskModel: KioskModel) => {
		setModelToDelete(kioskModel);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setModelToDelete(null);
	}, []);

	const handleDelete = React.useCallback(() => {
		if (!modelToDelete) return;
		dispatchMethod({ id: modelToDelete.id });
	}, [dispatchMethod, modelToDelete]);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_models.messages.delete_success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { handleCloseDeleteModal(); onDeleteSuccess(); },
		onError: () => { handleCloseDeleteModal(); onDeleteError(); },
	});

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		modelToDelete,
	};
};
