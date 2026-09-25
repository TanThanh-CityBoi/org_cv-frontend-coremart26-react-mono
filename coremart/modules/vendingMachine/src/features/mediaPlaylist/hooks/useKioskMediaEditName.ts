import { useUIState } from '@nikkierp/shell/contexts';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskMediaService } from '../kioskMediaService';

import type { KioskMedia } from '../types';


export interface UseKioskMediaEditNameProps {
	onEditSuccess?: () => void;
	onEditError?: () => void;
}

// eslint-disable-next-line max-lines-per-function -- modal state + async update name
export const useKioskMediaEditName = ({
	onEditSuccess = () => {},
	onEditError = () => {},
}: UseKioskMediaEditNameProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const [mediaToEdit, setMediaToEdit] = useState<KioskMedia | null>(null);
	const [nameDraft, setNameDraft] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleOpenEditModal = useCallback((km: KioskMedia) => {
		setMediaToEdit(km);
		setNameDraft(km.name);
	}, []);

	const resetEditModal = useCallback(() => {
		setMediaToEdit(null);
		setNameDraft('');
	}, []);

	const handleCloseEditModal = useCallback(() => {
		if (isSaving) return;
		resetEditModal();
	}, [isSaving, resetEditModal]);

	const handleSaveName = useCallback(async () => {
		if (!mediaToEdit || isSaving) return;
		const trimmed = nameDraft.trim();
		if (!trimmed) {
			notification.showError(
				translate('coremart.vendingMachine.kioskMedia.create.validation.name'),
				translate('nikki.general.messages.error'),
			);
			return;
		}
		if (!mediaToEdit.etag) {
			notification.showError(
				translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			return;
		}
		if (trimmed === mediaToEdit.name) {
			resetEditModal();
			return;
		}
		setIsSaving(true);
		try {
			await kioskMediaService.updateKioskMediaName(mediaToEdit.id, {
				etag: mediaToEdit.etag,
				name: trimmed,
			});
			notification.showInfo(
				translate('coremart.vendingMachine.kioskMedia.messages.update_name_success'),
				translate('nikki.general.messages.success'),
			);
			resetEditModal();
			onEditSuccess();
		}
		catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			notification.showError(
				translate('coremart.vendingMachine.kioskMedia.messages.update_name_failed', { message: msg }),
				translate('nikki.general.messages.error'),
			);
			onEditError();
		}
		finally {
			setIsSaving(false);
		}
	}, [
		mediaToEdit, nameDraft, isSaving, notification, translate, resetEditModal, onEditSuccess, onEditError,
	]);

	const isOpenEditModal = mediaToEdit != null;

	return {
		handleOpenEditModal,
		handleCloseEditModal,
		handleSaveName,
		nameDraft,
		setNameDraft,
		isOpenEditModal,
		mediaToEdit,
		isSaving,
	};
};
