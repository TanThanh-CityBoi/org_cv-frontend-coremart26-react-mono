import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { settingStoreService } from '../settingStoreService';
import { Setting } from '../types';


import type { SettingUpdateBody } from './useSettingEdit';


export interface SettingCreateFormData {
	name: string;
	code?: string;
	description?: string;
	config?: Record<string, unknown> | null;
}

export type SettingCreatePayload = SettingCreateFormData;

type CreateResponse = { id: string };

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

	const { dispatchMethod, result } = useServiceLayer<CreateResponse>(settingStoreService.create);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: SettingCreateFormData) => {
		dispatchMethod(buildSettingCreatePayload(data));
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'settings.messages.create_success',
		errorKey: 'errors.createFailed',
		onSuccess: () => {
			const createdId = result.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		},
	});

	return { isSubmitting: result.isPending, handleSubmit, handleCancel };
}
