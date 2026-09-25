import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskModelCrudService } from '../kioskModelService';
import { KioskModel } from '../types';


export interface UseKioskModelArchiveProps {
	onArchiveSuccess?: () => void;
	onArchiveError?: () => void;
}

type PendingArchive = { model: KioskModel, targetArchived: boolean };


export const useKioskModelArchive = ({
	onArchiveSuccess = () => {},
	onArchiveError = () => {},
}: UseKioskModelArchiveProps = {
	onArchiveSuccess: () => {},
	onArchiveError: () => {},
}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');

	const { dispatchMethod, result } = useServiceLayer(kioskModelCrudService.setIsArchived);
	// Which direction the in-flight call was, since the response body does not say.
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);

	const [pendingArchive, setPendingArchive] = React.useState<PendingArchive | null>(null);

	const handleCloseModal = React.useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleOpenArchiveModal = React.useCallback((kioskModel: KioskModel) => {
		setPendingArchive({ model: kioskModel, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = React.useCallback((kioskModel: KioskModel) => {
		setPendingArchive({ model: kioskModel, targetArchived: false });
	}, []);

	const handleConfirmArchive = React.useCallback(() => {
		if (!pendingArchive?.model.etag) {
			notification.showError(
				translate('errors.updateFailed'),
				translate('messages.error'),
			);
			return;
		}
		const { id, etag } = pendingArchive.model;
		const { targetArchived } = pendingArchive;
		pendingTargetArchivedRef.current = targetArchived;
		dispatchMethod({ id, etag, is_archived: targetArchived });
	}, [dispatchMethod, notification, pendingArchive, translate]);

	useMutationOutcome(result, {
		successKey: () => (pendingTargetArchivedRef.current === true
			? 'kiosk_models.messages.archive_success'
			: 'kiosk_models.messages.restore_success'),
		errorKey: 'errors.updateFailed',
		onSuccess: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onArchiveSuccess(); },
		onError: () => { pendingTargetArchivedRef.current = null; handleCloseModal(); onArchiveError(); },
	});

	const isOpenArchiveModal = pendingArchive != null;

	return {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal,
		isOpenArchiveModal,
		pendingArchive,
	};
};
