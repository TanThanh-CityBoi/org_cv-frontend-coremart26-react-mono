import { useUIState } from '@nikkierp/shell/contexts';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskMediaService } from '../kioskMediaService';

import type { KioskMedia } from '../types';


export interface UseKioskMediaDeleteProps {
	onDeleteSuccess?: (deletedId: string) => void;
	onDeleteError?: () => void;
}

// eslint-disable-next-line max-lines-per-function -- modal state + async delete; aligned with useKioskModelDelete
export const useKioskMediaDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UseKioskMediaDeleteProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
	const [mediaToDelete, setMediaToDelete] = useState<KioskMedia | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleOpenDeleteModal = useCallback((km: KioskMedia) => {
		setMediaToDelete(km);
		setIsOpenDeleteModal(true);
	}, []);

	const resetDeleteModal = useCallback(() => {
		setIsOpenDeleteModal(false);
		setMediaToDelete(null);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		if (isDeleting) return;
		resetDeleteModal();
	}, [isDeleting, resetDeleteModal]);

	const handleDelete = useCallback(async () => {
		if (!mediaToDelete || isDeleting) return;
		setIsDeleting(true);
		const deletedId = mediaToDelete.id;
		try {
			await kioskMediaService.deleteKioskMedia(deletedId);
			notification.showInfo(
				translate('coremart.vendingMachine.kioskMedia.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			resetDeleteModal();
			onDeleteSuccess(deletedId);
		}
		catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			notification.showError(
				msg || translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			onDeleteError();
		}
		finally {
			setIsDeleting(false);
		}
	}, [mediaToDelete, isDeleting, notification, translate, resetDeleteModal, onDeleteSuccess, onDeleteError]);

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		mediaToDelete,
		isDeleting,
	};
};
