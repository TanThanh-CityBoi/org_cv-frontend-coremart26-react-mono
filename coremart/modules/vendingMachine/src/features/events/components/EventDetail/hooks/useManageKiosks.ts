import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMutationOutcome } from '../../../../../common/hooks/useMutationOutcome';
import { Kiosk } from '../../../../kiosks/types';
import { eventCrudService } from '../../../eventService';

import type { Event } from '../../../types';


type UseAssignKiosksToEventArgs = {
	event: Event,
	onAssignSuccess?: () => void,
	onAssignError?: () => void,
};


export function useAssignKiosksToEvent({
	event,
	onAssignSuccess = () => {},
	onAssignError = () => {},
}: UseAssignKiosksToEventArgs) {
	const { t: translate } = useTranslation('vending_machine');
	const { notification } = useUIState();
	const { dispatchMethod, result } = useServiceLayer(eventCrudService.manageKiosks);

	const handleAssignKiosks = useCallback(
		(picked: Kiosk[]) => {
			if (picked.length === 0) return;
			if (result.isPending) {
				notification.showError(
					translate('events.messages.remove_kiosk_wait'),
					translate('messages.error'),
				);
				return;
			}
			dispatchMethod({ eventId: event.id, add: picked.map((k) => k.id), remove: [] });
		},
		[dispatchMethod, event.id, notification, result.isPending, translate],
	);

	useMutationOutcome(result, {
		successKey: () => 'common.messages.update_success',
		errorKey: 'common.messages.update_failed',
		onSuccess: onAssignSuccess,
		onError: onAssignError,
	});

	return {
		isAssignLoading: result.isPending,
		handleAssignKiosks,
	};
}


type UseRemoveKioskFromEventArgs = {
	event: Event,
	onRemovedSuccess?: () => void,
	onRemovedError?: () => void,
};


export function useRemoveKioskFromEvent({
	event,
	onRemovedSuccess = () => {},
	onRemovedError = () => {},
}: UseRemoveKioskFromEventArgs) {
	const { dispatchMethod, result } = useServiceLayer(eventCrudService.manageKiosks);

	const [kioskToRemove, setKioskToRemove] = useState<Kiosk | null>(null);
	const [confirmModalOpened, setConfirmModalOpened] = useState(false);

	const closeConfirmModal = useCallback(() => {
		setKioskToRemove(null);
		setConfirmModalOpened(false);
	}, []);

	const openConfirmModal = useCallback((kiosk: Kiosk) => {
		setKioskToRemove(kiosk);
		setConfirmModalOpened(true);
	}, []);

	const handleRemoveKiosk = useCallback(() => {
		if (result.isPending || !kioskToRemove) return;
		dispatchMethod({ eventId: event.id, add: [], remove: [kioskToRemove.id] });
	}, [dispatchMethod, event.id, kioskToRemove, result.isPending]);

	// Assign and remove now hold separate service-layer results, so the requestId cross-talk
	// guards the shared slice entry needed are gone.
	useMutationOutcome(result, {
		successKey: () => 'common.messages.update_success',
		errorKey: 'common.messages.update_failed',
		onSuccess: () => { closeConfirmModal(); onRemovedSuccess(); },
		onError: () => { closeConfirmModal(); onRemovedError(); },
	});

	return {
		kioskToRemove,
		isRemoveLoading: confirmModalOpened && kioskToRemove != null && result.isPending,
		confirmModalOpened,
		openConfirmModal,
		closeConfirmModal,
		handleRemoveKiosk,
	};
}
