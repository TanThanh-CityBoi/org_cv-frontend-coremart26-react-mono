import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskSettingCrudService } from '../kioskSettingService';

import type { KioskSetting } from '../types';


export interface UseKioskSettingArchiveProps {
	onSuccess?: () => void;
	onError?: () => void;
}

type PendingArchive = { setting: KioskSetting, targetArchived: boolean };


export const useKioskSettingArchive = ({
	onSuccess = () => {},
	onError = () => {},
}: UseKioskSettingArchiveProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');

	const { dispatchMethod, result } = useServiceLayer(kioskSettingCrudService.setIsArchived);
	// Which direction the in-flight call was, since the response body does not say.
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);

	const [pendingArchive, setPendingArchive] = React.useState<PendingArchive | null>(null);

	const handleCloseModal = React.useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleOpenArchiveModal = React.useCallback((s: KioskSetting) => {
		setPendingArchive({ setting: s, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = React.useCallback((s: KioskSetting) => {
		setPendingArchive({ setting: s, targetArchived: false });
	}, []);

	const handleConfirmArchive = React.useCallback(() => {
		if (!pendingArchive?.setting.etag) {
			notification.showError(
				translate('errors.updateFailed'),
				translate('messages.error'),
			);
			return;
		}
		const { id, etag } = pendingArchive.setting;
		const { targetArchived } = pendingArchive;
		pendingTargetArchivedRef.current = targetArchived;
		dispatchMethod({ id, etag, is_archived: targetArchived });
	}, [dispatchMethod, notification, pendingArchive, translate]);

	useMutationOutcome(result, {
		successKey: () => (pendingTargetArchivedRef.current === true
			? 'kiosk_settings.messages.archive_success'
			: 'kiosk_settings.messages.restore_success'),
		errorKey: 'errors.updateFailed',
		onSuccess: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onSuccess(); },
		onError: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onError(); },
	});

	return {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseArchiveModal: handleCloseModal,
		isOpenArchiveModal: pendingArchive != null,
		pendingArchive,
	};
};
