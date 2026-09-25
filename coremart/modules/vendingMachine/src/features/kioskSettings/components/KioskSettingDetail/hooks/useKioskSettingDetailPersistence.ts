/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	VendingMachineDispatch,
	kioskSettingActions,
	selectDeleteKioskSetting,
	selectUpdateKioskSetting,
} from '@/appState';
import { KIOSK_SETTING_DETAIL_FIELDS } from '@/features/kioskSettings/kioskSettingSlice';

import type { KioskSettingUpdateFormData } from '../../../hooks/kioskSettingPayloads';
import type { KioskSetting } from '../../../types';


export type UseKioskSettingDetailPersistenceOptions = {
	onUpdateSuccess?: () => void;
	onDeleteSuccess?: () => void;
};

export function useKioskSettingDetailPersistence(
	setting: KioskSetting | undefined,
	options?: UseKioskSettingDetailPersistenceOptions,
) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const updateOutcome = useMicroAppSelector(selectUpdateKioskSetting);
	const deleteOutcome = useMicroAppSelector(selectDeleteKioskSetting);
	const updateRequestIdRef = useRef<string | null>(null);
	const deleteRequestIdRef = useRef<string | null>(null);
	const callbacksRef = useRef(options);

	callbacksRef.current = options;

	const refreshDetail = useCallback(() => {
		if (!setting?.id) return;
		dispatch(kioskSettingActions.getKioskSetting({
			id: setting.id,
			fields: KIOSK_SETTING_DETAIL_FIELDS,
		}));
	}, [dispatch, setting?.id]);

	useEffect(() => {
		const requestId = updateOutcome.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateOutcome.status === 'success') {
			updateRequestIdRef.current = null;
			dispatch(kioskSettingActions.resetUpdateKioskSetting());
			refreshDetail();
			callbacksRef.current?.onUpdateSuccess?.();
			notification.showInfo(
				translate('coremart.vendingMachine.kioskSettings.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
			return;
		}

		if (updateOutcome.status === 'error') {
			updateRequestIdRef.current = null;
			dispatch(kioskSettingActions.resetUpdateKioskSetting());
			notification.showError(
				updateOutcome.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [dispatch, notification, refreshDetail, translate, updateOutcome]);

	useEffect(() => {
		const requestId = deleteOutcome.requestId;
		const matchesDispatch = requestId != null && requestId === deleteRequestIdRef.current;
		if (!matchesDispatch) return;

		if (deleteOutcome.status === 'success') {
			deleteRequestIdRef.current = null;
			dispatch(kioskSettingActions.resetDeleteKioskSetting());
			notification.showInfo(
				translate('nikki.general.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			callbacksRef.current?.onDeleteSuccess?.();
			navigate('../kiosk-settings');
			return;
		}

		if (deleteOutcome.status === 'error') {
			deleteRequestIdRef.current = null;
			dispatch(kioskSettingActions.resetDeleteKioskSetting());
			notification.showError(
				deleteOutcome.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [deleteOutcome, dispatch, navigate, notification, translate]);

	const onSaveSettings = useCallback((updates: Partial<Omit<KioskSettingUpdateFormData, 'id' | 'etag'>>) => {
		if (!setting) return;
		const action = dispatch(kioskSettingActions.updateKioskSetting({
			id: setting.id,
			body: { id: setting.id, etag: setting.etag, ...updates },
		}));
		updateRequestIdRef.current = action.requestId ?? null;
	}, [dispatch, setting]);

	const onDelete = useCallback(() => {
		if (!setting) return;
		const action = dispatch(kioskSettingActions.deleteKioskSetting({ id: setting.id }));
		deleteRequestIdRef.current = action.requestId ?? null;
	}, [dispatch, setting]);

	return {
		onSaveSettings,
		onDelete,
		isSaveSubmitting: updateOutcome.status === 'pending',
	};
}
