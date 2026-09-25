import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { settingStoreService } from '../settingStoreService';
import { Setting } from '../types';


export interface UseSettingArchiveProps {
	onSuccess?: () => void;
	onError?: () => void;
}

type PendingArchive = { setting: Setting, targetArchived: boolean };

export const useSettingArchive = ({
	onSuccess = () => {},
	onError = () => {},
}: UseSettingArchiveProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');

	const { dispatchMethod, result } = useServiceLayer(settingStoreService.setIsArchived);
	// Which direction the in-flight call was, since the response body does not say.
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);

	const [pendingArchive, setPendingArchive] = React.useState<PendingArchive | null>(null);

	const handleCloseModal = React.useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleOpenArchiveModal = React.useCallback((settingItem: Setting) => {
		setPendingArchive({ setting: settingItem, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = React.useCallback((settingItem: Setting) => {
		setPendingArchive({ setting: settingItem, targetArchived: false });
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
		dispatchMethod({ id, etag, isArchived: targetArchived });
	}, [dispatchMethod, notification, pendingArchive, translate]);

	useMutationOutcome(result, {
		successKey: () => (pendingTargetArchivedRef.current === true
			? 'settings.messages.archive_success'
			: 'settings.messages.restore_success'),
		errorKey: 'errors.updateFailed',
		onSuccess: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onSuccess(); },
		onError: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onError(); },
	});

	return {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal,
		isOpenArchiveModal: pendingArchive != null,
		pendingArchive,
	};
};
