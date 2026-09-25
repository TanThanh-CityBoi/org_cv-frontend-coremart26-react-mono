/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	kioskSettingActions,
	selectKioskSettingArchiveOutcome,
	VendingMachineDispatch,
} from '@/appState';

import type { KioskSetting } from '@/features/kioskSettings/types';
import type { RestArchiveResponse } from '@/types';


export interface UseKioskSettingArchiveProps {
	onSuccess?: () => void;
	onError?: () => void;
}

type PendingArchive = { setting: KioskSetting; targetArchived: boolean };

function useArchiveOutcomeSync(
	archiveState: ReduxActionState<RestArchiveResponse>,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	pendingTargetArchivedRef: React.RefObject<boolean | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleCloseModal: () => void,
	onArchiveSuccess: () => void,
	onArchiveError: () => void,
) {
	React.useEffect(() => {
		const requestId = archiveState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (archiveState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			const archived = pendingTargetArchivedRef.current === true;
			pendingTargetArchivedRef.current = null;
			const messageKey = archived
				? 'coremart.vendingMachine.kioskSettings.messages.archive_success'
				: 'coremart.vendingMachine.kioskSettings.messages.restore_success';
			notification.showInfo(
				translate(messageKey),
				translate('nikki.general.messages.success'),
			);
			handleCloseModal();
			onArchiveSuccess();
			dispatch(kioskSettingActions.resetArchiveKioskSetting());
			return;
		}
		if (archiveState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			pendingTargetArchivedRef.current = null;
			notification.showError(
				archiveState.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			handleCloseModal();
			onArchiveError();
			dispatch(kioskSettingActions.resetArchiveKioskSetting());
		}
	}, [
		archiveState,
		dispatch,
		notification,
		translate,
		handleCloseModal,
		onArchiveSuccess,
		onArchiveError,
	]);
}

export const useKioskSettingArchive = ({
	onSuccess = () => {},
	onError = () => {},
}: UseKioskSettingArchiveProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const dispatchedArchiveRequestIdRef = React.useRef<string | null>(null);
	const pendingTargetArchivedRef = React.useRef<boolean | null>(null);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const archiveState = useMicroAppSelector(selectKioskSettingArchiveOutcome);

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
				translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			return;
		}
		const { id, etag } = pendingArchive.setting;
		const { targetArchived } = pendingArchive;
		pendingTargetArchivedRef.current = targetArchived;
		const action = dispatch(kioskSettingActions.setArchivedKioskSetting({ id, etag, isArchived: targetArchived }));
		dispatchedArchiveRequestIdRef.current = action.requestId;
	}, [dispatch, notification, pendingArchive, translate]);

	useArchiveOutcomeSync(
		archiveState,
		dispatchedArchiveRequestIdRef,
		pendingTargetArchivedRef,
		dispatch,
		notification,
		translate,
		handleCloseModal,
		onSuccess,
		onError,
	);

	return {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseArchiveModal: handleCloseModal,
		isOpenArchiveModal: pendingArchive != null,
		pendingArchive,
	};
};
