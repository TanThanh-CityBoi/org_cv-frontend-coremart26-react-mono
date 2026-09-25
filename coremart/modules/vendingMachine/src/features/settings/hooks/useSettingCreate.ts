import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { VendingMachineDispatch, settingActions, selectCreateSetting } from '@/appState';
import { Setting } from '@/features/settings/types';
import type { SettingUpdateBody } from './useSettingEdit';


export interface SettingCreateFormData {
	name: string;
	code?: string;
	description?: string;
	config?: Record<string, unknown> | null;
}

export type SettingCreatePayload = SettingCreateFormData;

export function settingToCreateFormValues(setting: Setting): SettingCreateFormData {
	return {
		name: setting.name,
		code: setting.code,
		description: setting.description,
		config: setting.config,
	};
}

export function formDataToSettingUpdateBody(
	data: SettingCreateFormData,
): Omit<SettingUpdateBody, 'etag'> {
	return {
		name: data.name,
		description: data.description,
		config: data.config,
	};
}

function buildSettingCreatePayload(data: SettingCreateFormData): SettingCreatePayload {
	return {
		name: data.name,
		code: data.code || `SETTING-${Date.now()}`,
		description: data.description,
		config: data.config,
	};
}

export function useSettingCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createSetting = useMicroAppSelector(selectCreateSetting);
	const createRequestIdRef = React.useRef<string | null>(null);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: SettingCreateFormData) => {
		const payload = buildSettingCreatePayload(data);
		const action = dispatch(settingActions.createSetting(payload));
		createRequestIdRef.current = action.requestId;
	}, [dispatch]);

	const isSubmitting = createSetting.status === 'pending';

	React.useEffect(() => {
		const requestId = createSetting.requestId;
		const matchesDispatch = requestId != null && requestId === createRequestIdRef.current;
		if (!matchesDispatch) return;

		if (createSetting.status === 'success') {
			createRequestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.settings.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(settingActions.resetCreateSetting());
			dispatch(settingActions.listSettings());
			const createdId = createSetting.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createSetting.status === 'error') {
			createRequestIdRef.current = null;
			notification.showError(
				createSetting.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(settingActions.resetCreateSetting());
		}
	}, [createSetting, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
