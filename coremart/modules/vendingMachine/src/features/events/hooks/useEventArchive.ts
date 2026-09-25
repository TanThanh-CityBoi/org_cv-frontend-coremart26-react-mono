import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { eventCrudService } from '../eventService';

import type { Event } from '../types';


export interface UseEventArchiveProps {
	onSuccess?: () => void;
	onError?: () => void;
}

type PendingArchive = { event: Event, targetArchived: boolean };


export const useEventArchive = ({
	onSuccess = () => {},
	onError = () => {},
}: UseEventArchiveProps = {
	onSuccess: () => {},
	onError: () => {},
}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');

	const { dispatchMethod, result } = useServiceLayer(eventCrudService.setIsArchived);
	// Which direction the in-flight call was, since the response body does not say.
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);

	const [pendingArchive, setPendingArchive] = React.useState<PendingArchive | null>(null);

	const handleCloseModal = React.useCallback(() => {
		setPendingArchive(null);
	}, []);

	const handleOpenArchiveModal = React.useCallback((evt: Event) => {
		setPendingArchive({ event: evt, targetArchived: true });
	}, []);

	const handleOpenRestoreModal = React.useCallback((evt: Event) => {
		setPendingArchive({ event: evt, targetArchived: false });
	}, []);

	const handleConfirmArchive = React.useCallback(() => {
		if (!pendingArchive?.event.etag) {
			notification.showError(
				translate('errors.updateFailed'),
				translate('messages.error'),
			);
			return;
		}
		const { id, etag } = pendingArchive.event;
		const { targetArchived } = pendingArchive;
		pendingTargetArchivedRef.current = targetArchived;
		dispatchMethod({ id, etag, is_archived: targetArchived });
	}, [dispatchMethod, notification, pendingArchive, translate]);

	useMutationOutcome(result, {
		successKey: () => (pendingTargetArchivedRef.current === true
			? 'events.messages.archive_success'
			: 'events.messages.restore_success'),
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
