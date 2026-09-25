import { useUIState } from '@nikkierp/shell/contexts';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskMediaService } from '../kioskMediaService';

import type { KioskMedia } from '../types';


export interface UseKioskMediaArchiveProps {
	onArchiveSuccess?: () => void;
	onArchiveError?: () => void;
}

type PendingArchive = { media: KioskMedia; targetArchived: boolean };

/* eslint-disable max-lines-per-function -- mirrors useKioskModelArchive confirm + async API */
export const useKioskMediaArchive = ({
	onArchiveSuccess = () => {},
	onArchiveError = () => {},
}: UseKioskMediaArchiveProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const [pendingArchive, setPendingArchive] = useState<PendingArchive | null>(null);
	const [isArchiving, setIsArchiving] = useState(false);

	const resetArchiveModal = useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleCloseModal = useCallback(() => {
		if (isArchiving) return;
		resetArchiveModal();
	}, [isArchiving, resetArchiveModal]);

	const handleOpenArchiveModal = useCallback((km: KioskMedia) => {
		setPendingArchive({ media: km, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = useCallback((km: KioskMedia) => {
		setPendingArchive({ media: km, targetArchived: false });
	}, []);

	const handleConfirmArchive = useCallback(async () => {
		if (!pendingArchive?.media.etag) {
			notification.showError(
				translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			return;
		}
		if (isArchiving) return;
		const { id, etag } = pendingArchive.media;
		const { targetArchived } = pendingArchive;
		setIsArchiving(true);
		try {
			await kioskMediaService.setKioskMediaArchived(id, { etag, isArchived: targetArchived });
			const messageKey = targetArchived
				? 'coremart.vendingMachine.kioskMedia.messages.archive_success'
				: 'coremart.vendingMachine.kioskMedia.messages.restore_success';
			notification.showInfo(
				translate(messageKey),
				translate('nikki.general.messages.success'),
			);
			resetArchiveModal();
			onArchiveSuccess();
		}
		catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			notification.showError(
				msg || translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			onArchiveError();
		}
		finally {
			setIsArchiving(false);
		}
	}, [
		pendingArchive, isArchiving, notification, translate, resetArchiveModal, onArchiveSuccess, onArchiveError,
	]);

	const isOpenArchiveModal = pendingArchive != null;

	return {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal,
		isOpenArchiveModal,
		pendingArchive,
		isArchiving,
	};
};
