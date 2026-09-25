import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { settingActions, selectDeleteSetting, VendingMachineDispatch } from '@/appState';
import { RestDeleteResponse } from '@/types';

import { Setting } from '../types';


export interface UseSettingDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}

function useDeleteOutcomeSync(
	deleteState: ReduxActionState<RestDeleteResponse>,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleCloseDeleteModal: () => void,
	onDeleteSuccess: () => void,
	onDeleteError: () => void,
) {
	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.settings.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			handleCloseDeleteModal();
			onDeleteSuccess();
			dispatch(settingActions.resetDeleteSetting());
			dispatch(settingActions.listSettings());
			return;
		}
		if (deleteState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			handleCloseDeleteModal();
			onDeleteError();
			dispatch(settingActions.resetDeleteSetting());
		}
	}, [deleteState, dispatch, notification, translate, handleCloseDeleteModal, onDeleteSuccess, onDeleteError]);
}

export const useSettingDelete = ({
	onDeleteSuccess = () => {},
	onDeleteError = () => {},
}: UseSettingDeleteProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const dispatchedDeleteRequestIdRef = React.useRef<string | null>(null);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteSetting);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [settingToDelete, setSettingToDelete] = React.useState<Setting | null>(null);

	const handleOpenDeleteModal = React.useCallback((setting: Setting) => {
		setSettingToDelete(setting);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setSettingToDelete(null);
	}, []);

	const handleDelete = React.useCallback(() => {
		if (!settingToDelete) return;
		const pendingAction = dispatch(settingActions.deleteSetting({ id: settingToDelete.id }));
		dispatchedDeleteRequestIdRef.current = pendingAction.requestId;
	}, [dispatch, settingToDelete]);

	useDeleteOutcomeSync(
		deleteState,
		dispatchedDeleteRequestIdRef,
		dispatch,
		notification,
		translate,
		handleCloseDeleteModal,
		onDeleteSuccess,
		onDeleteError,
	);

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		settingToDelete,
	};
};
