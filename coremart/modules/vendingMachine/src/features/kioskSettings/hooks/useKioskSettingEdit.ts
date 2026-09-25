import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, kioskSettingActions, selectUpdateKioskSetting } from '@/appState';

import type { KioskSettingUpdateFormData, KioskSettingUpdatePayload } from './kioskSettingPayloads';
import type { KioskSetting } from '../types';


export type KioskSettingBasicInfoFormData = {
	name: string;
	description?: string;
};

export function kioskSettingToFormModelValues(setting: KioskSetting) {
	return {
		id: setting.id,
		code: setting.code,
		name: setting.name,
		description: setting.description ?? '',
		createdAt: setting.createdAt,
	};
}

export function formDataToKioskSettingBasicUpdates(
	data: KioskSettingBasicInfoFormData,
): Pick<KioskSettingUpdateFormData, 'name' | 'description'> {
	return {
		name: data.name,
		description: data.description,
	};
}

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	onUpdateSuccess?: () => void,
) {
	const updateKioskSetting = useMicroAppSelector(selectUpdateKioskSetting);
	const updateRequestIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		const requestId = updateKioskSetting.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateKioskSetting.status === 'success') {
			updateRequestIdRef.current = null;
			dispatch(kioskSettingActions.resetUpdateKioskSetting());
			onUpdateSuccess?.();

			notification.showInfo(
				translate('coremart.vendingMachine.kioskSettings.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
		}
		else if (updateKioskSetting.status === 'error') {
			updateRequestIdRef.current = null;
			dispatch(kioskSettingActions.resetUpdateKioskSetting());

			notification.showError(
				updateKioskSetting.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [updateKioskSetting, dispatch, notification, translate, navigate, location, onUpdateSuccess]);

	const handleSubmit = useCallback((payload: KioskSettingUpdatePayload) => {
		const action = dispatch(kioskSettingActions.updateKioskSetting(payload));
		updateRequestIdRef.current = action.requestId;
	}, [dispatch]);

	return {
		isSubmitting: updateKioskSetting.status === 'pending',
		handleSubmit,
	};
}

export function useKioskSettingEdit(setting: KioskSetting | undefined, options?: { onUpdateSuccess?: () => void }) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();

	const { isSubmitting, handleSubmit } = useSubmitHandler(
		dispatch,
		notification,
		translate,
		navigate,
		location,
		options?.onUpdateSuccess,
	);

	const submit = useCallback(
		(updates: Omit<KioskSettingUpdateFormData, 'id' | 'etag'>) => {
			if (setting) {
				handleSubmit({
					id: setting.id,
					body: { id: setting.id, etag: setting.etag, ...updates },
				});
			}
		},
		[handleSubmit, setting],
	);

	return { isSubmitting, handleSubmit: submit };
}
