/* eslint-disable max-lines-per-function */



import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	eventActions,
	selectManageEventKiosksOutcome,
	VendingMachineDispatch,
} from '@/appState';
import { Kiosk } from '@/features/kiosks/types';
import { RestUpdateResponse } from '@/types';

import type { Event } from '@/features/events/types';



type UseAssignKiosksToEventArgs = {
	event: Event;
	onAssignSuccess?: () => void;
	onAssignError?: () => void;
};

export function useAssignKiosksToEvent({
	event,
	onAssignSuccess = () => {},
	onAssignError = () => {},
}: UseAssignKiosksToEventArgs) {
	const { t: translate } = useTranslation();
	const { notification } = useUIState();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const manageState = useMicroAppSelector(selectManageEventKiosksOutcome);
	const assignRequestIdRef = useRef<string | null>(null);


	const handleAssignKiosks = useCallback(
		(picked: Kiosk[]) => {
			if (picked.length === 0) return;
			if (manageState.status === 'pending') {
				notification.showError(
					translate('coremart.vendingMachine.events.messages.remove_kiosk_wait', {
						defaultValue: 'Please wait for the current update to finish.',
					}),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			const pendingAction = dispatch(
				eventActions.manageEventKiosks({
					eventId: event.id,
					add: picked.map((k) => k.id),
					remove: [],
				}),
			);
			assignRequestIdRef.current = pendingAction.requestId ?? null;
		},
		[dispatch, event.id, manageState.status, notification, translate],
	);

	useAssignKiosksManageSync(
		manageState,
		assignRequestIdRef,
		dispatch,
		notification,
		onAssignSuccess,
		onAssignError,
	);

	const isAssignLoading = Boolean(
		manageState.status === 'pending'
		&& manageState.requestId != null
		&& manageState.requestId === assignRequestIdRef.current,
	);

	return {
		isAssignLoading,
		handleAssignKiosks,
	};
}

function useAssignKiosksManageSync(
	manageState: ReduxActionState<RestUpdateResponse>,
	requestIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	onAssignSuccess?: () => void,
	onAssignError?: () => void,
) {
	const { t: translate } = useTranslation();
	useEffect(() => {
		const requestId = manageState.requestId;
		const matchesDispatch = requestId != null && requestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (manageState.status === 'success') {
			requestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.common.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
			onAssignSuccess?.();
			dispatch(eventActions.resetManageEventKiosks());
			return;
		}
		if (manageState.status === 'error') {
			requestIdRef.current = null;
			notification.showError(
				manageState.error ?? translate('coremart.vendingMachine.common.messages.update_failed'),
				translate('nikki.general.messages.error'),
			);
			onAssignError?.();
			dispatch(eventActions.resetManageEventKiosks());
		}
	}, [
		dispatch,
		manageState.error,
		manageState.requestId,
		manageState.status,
		notification,
		onAssignSuccess,
		onAssignError,
		translate,
	]);
}



type UseRemoveKioskFromEventArgs = {
	event: Event;
	onRemovedSuccess?: () => void;
	onRemovedError?: () => void;
};

function useRemoveKioskManageSync(
	manageState: ReduxActionState<RestUpdateResponse>,
	requestIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	onRemovedSuccess?: () => void,
	onRemovedError?: () => void,
) {
	const { t: translate } = useTranslation();

	useEffect(() => {
		const requestId = manageState.requestId;
		const matchesDispatch = requestId != null && requestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (manageState.status === 'success') {
			requestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.common.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
			onRemovedSuccess?.();
			dispatch(eventActions.resetManageEventKiosks());
			return;
		}
		if (manageState.status === 'error') {
			requestIdRef.current = null;
			notification.showError(
				manageState.error ?? translate('coremart.vendingMachine.common.messages.update_failed'),
				translate('nikki.general.messages.error'),
			);
			onRemovedError?.();
			dispatch(eventActions.resetManageEventKiosks());
		}
	}, [
		dispatch,
		manageState.error,
		manageState.requestId,
		manageState.status,
		notification,
		onRemovedSuccess,
		onRemovedError,
		translate,
	]);
}

export function useRemoveKioskFromEvent({
	event,
	onRemovedSuccess = () => {},
	onRemovedError = () => {},
}: UseRemoveKioskFromEventArgs) {
	const { notification } = useUIState();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const manageState = useMicroAppSelector(selectManageEventKiosksOutcome);
	const removeRequestIdRef = useRef<string | null>(null);

	const [kioskToRemove, setKioskToRemove] = useState<Kiosk | null>(null);
	const [confirmModalOpened, setConfirmModalOpened] = useState(false);

	const closeConfirmModal = useCallback(() => {
		setKioskToRemove(null);
		setConfirmModalOpened(false);
	}, [setKioskToRemove, setConfirmModalOpened]);

	const openConfirmModal = useCallback((kiosk: Kiosk) => {
		setKioskToRemove(kiosk);
		setConfirmModalOpened(true);
	}, [setKioskToRemove, setConfirmModalOpened]);

	const handleRemoveKiosk = useCallback(() => {
		if (manageState.status === 'pending' || !kioskToRemove) return;
		const pendingAction = dispatch(
			eventActions.manageEventKiosks({
				eventId: event.id,
				add: [],
				remove: [kioskToRemove.id],
			}),
		);
		removeRequestIdRef.current = pendingAction.requestId ?? null;
	}, [dispatch, event.id, kioskToRemove, manageState.status]);

	const onSuccess = useCallback(() => {
		closeConfirmModal();
		onRemovedSuccess?.();
	}, [closeConfirmModal, onRemovedSuccess]);
	const onError = useCallback(() => {
		closeConfirmModal();
		onRemovedError?.();
	}, [closeConfirmModal, onRemovedError]);

	useRemoveKioskManageSync(
		manageState,
		removeRequestIdRef,
		dispatch,
		notification,
		onSuccess,
		onError,
	);

	const isRemoveLoading = Boolean(
		confirmModalOpened
		&& manageState.status === 'pending'
		&& manageState.requestId != null
		&& manageState.requestId === removeRequestIdRef.current,
	);

	return {
		kioskToRemove,
		isRemoveLoading,
		confirmModalOpened,
		openConfirmModal,
		closeConfirmModal,
		handleRemoveKiosk,
	};
}
