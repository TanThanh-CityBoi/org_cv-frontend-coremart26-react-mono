import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskCrudService } from '../kioskService';
import { Kiosk } from '../types';


export interface UseKioskArchiveProps {
	onSuccess?: () => void;
	onError?: () => void;
}

type PendingArchive = { kiosk: Kiosk, targetArchived: boolean };

export const useKioskArchive = ({
	onSuccess = () => {},
	onError = () => {},
}: UseKioskArchiveProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');

	const { dispatchMethod, result } = useServiceLayer(kioskCrudService.setIsArchived);
	// Which direction the in-flight call was, since the response body does not say.
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);

	const [pendingArchive, setPendingArchive] = React.useState<PendingArchive | null>(null);

	const handleCloseModal = React.useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleOpenArchiveModal = React.useCallback((kiosk: Kiosk) => {
		setPendingArchive({ kiosk, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = React.useCallback((kiosk: Kiosk) => {
		setPendingArchive({ kiosk, targetArchived: false });
	}, []);

	const handleConfirmArchive = React.useCallback(() => {
		if (!pendingArchive?.kiosk.etag) {
			notification.showError(
				translate('errors.updateFailed'),
				translate('messages.error'),
			);
			return;
		}
		const { id, etag } = pendingArchive.kiosk;
		const { targetArchived } = pendingArchive;
		pendingTargetArchivedRef.current = targetArchived;
		dispatchMethod({ id, etag, is_archived: targetArchived });
	}, [dispatchMethod, notification, pendingArchive, translate]);

	useMutationOutcome(result, {
		successKey: () => (pendingTargetArchivedRef.current === true
			? 'kiosk.messages.archive_success'
			: 'kiosk.messages.restore_success'),
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
