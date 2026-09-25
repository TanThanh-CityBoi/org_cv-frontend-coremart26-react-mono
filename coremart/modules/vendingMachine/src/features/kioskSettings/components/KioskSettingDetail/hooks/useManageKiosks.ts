/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	kioskSettingActions,
	selectManageKioskSettingKiosksOutcome,
	VendingMachineDispatch,
} from '@/appState';
import { Kiosk } from '@/features/kiosks/types';
import { RestUpdateResponse } from '@/types';

import type { KioskSetting } from '../../../types';


type UseAssignKiosksToSettingArgs = {
	setting: KioskSetting;
	onAssignSuccess?: () => void;
	onAssignError?: () => void;
};

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
			dispatch(kioskSettingActions.resetManageKioskSettingKiosks());
			return;
		}
		if (manageState.status === 'error') {
			requestIdRef.current = null;
			notification.showError(
				manageState.error ?? translate('coremart.vendingMachine.common.messages.update_failed'),
				translate('nikki.general.messages.error'),
			);
			onAssignError?.();
			dispatch(kioskSettingActions.resetManageKioskSettingKiosks());
		}
	}, [
		dispatch,
		manageState.error,
		manageState.requestId,
		manageState.status,
		notification,
		onAssignError,
		onAssignSuccess,
		translate,
	]);
}

export function useAssignKiosksToSetting({
	setting,
	onAssignSuccess = () => {},
	onAssignError = () => {},
}: UseAssignKiosksToSettingArgs) {
	const { t: translate } = useTranslation();
	const { notification } = useUIState();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const manageState = useMicroAppSelector(selectManageKioskSettingKiosksOutcome);

	const assignRequestIdRef = useRef<string | null>(null);

	const handleAssignKiosks = useCallback(
		(picked: Kiosk[]) => {
			if (picked.length === 0) return;
			if (manageState.status === 'pending') {
				notification.showError(
					translate('coremart.vendingMachine.common.messages.update_failed'),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			const pendingAction = dispatch(
				kioskSettingActions.manageKioskSettingKiosks({
					settingId: setting.id,
					add: picked.map((k) => k.id),
					remove: [],
				}),
			);
			assignRequestIdRef.current = pendingAction.requestId ?? null;
		},
		[dispatch, manageState.status, notification, setting.id, translate],
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
		handleAssignKiosks,
		isAssignLoading,
	};
}


type UseRemoveKioskFromSettingArgs = {
	setting: KioskSetting;
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
			dispatch(kioskSettingActions.resetManageKioskSettingKiosks());
			return;
		}
		if (manageState.status === 'error') {
			requestIdRef.current = null;
			notification.showError(
				manageState.error ?? translate('coremart.vendingMachine.common.messages.update_failed'),
				translate('nikki.general.messages.error'),
			);
			onRemovedError?.();
			dispatch(kioskSettingActions.resetManageKioskSettingKiosks());
		}
	}, [
		dispatch,
		manageState.error,
		manageState.requestId,
		manageState.status,
		notification,
		onRemovedError,
		onRemovedSuccess,
		translate,
	]);
}

export function useRemoveKioskFromSetting({
	setting,
	onRemovedSuccess = () => {},
	onRemovedError = () => {},
}: UseRemoveKioskFromSettingArgs) {
	const { t: translate } = useTranslation();
	const { notification } = useUIState();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const manageState = useMicroAppSelector(selectManageKioskSettingKiosksOutcome);
	const removeRequestIdRef = useRef<string | null>(null);

	const [kioskToRemove, setKioskToRemove] = useState<Kiosk | null>(null);
	const [confirmModalOpened, setConfirmModalOpened] = useState(false);

	const closeConfirmModal = useCallback(() => {
		if (manageState.status === 'pending' && removeRequestIdRef.current != null) return;
		setKioskToRemove(null);
		setConfirmModalOpened(false);
	}, [manageState.status]);

	const openConfirmModal = useCallback(
		(kiosk: Kiosk) => {
			if (manageState.status === 'pending') {
				notification.showError(
					translate('coremart.vendingMachine.common.messages.update_failed'),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			setKioskToRemove(kiosk);
			setConfirmModalOpened(true);
		},
		[manageState.status, notification, translate],
	);

	const handleRemoveKiosk = useCallback(() => {
		if (manageState.status === 'pending' || !kioskToRemove) return;
		const pendingAction = dispatch(
			kioskSettingActions.manageKioskSettingKiosks({
				settingId: setting.id,
				add: [],
				remove: [kioskToRemove.id],
			}),
		);
		removeRequestIdRef.current = pendingAction.requestId ?? null;
	}, [dispatch, kioskToRemove, manageState.status, setting.id]);

	const onSuccess = useCallback(() => {
		closeConfirmModal();
		onRemovedSuccess();
	}, [closeConfirmModal, onRemovedSuccess]);
	const onError = useCallback(() => {
		closeConfirmModal();
		onRemovedError();
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
		&& kioskToRemove
		&& manageState.status === 'pending'
		&& manageState.requestId != null
		&& manageState.requestId === removeRequestIdRef.current,
	);

	return {
		settingName: setting.name ?? setting.code ?? setting.id,
		kioskToRemove,
		isRemoveLoading,
		confirmModalOpened,
		openConfirmModal,
		closeConfirmModal,
		handleRemoveKiosk,
	};
}
