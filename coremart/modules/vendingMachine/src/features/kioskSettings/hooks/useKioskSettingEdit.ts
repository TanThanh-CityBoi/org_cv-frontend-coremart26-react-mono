import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskSettingCrudService } from '../kioskSettingService';

import type { KioskSettingUpdateFormData } from './kioskSettingPayloads';
import type { KioskSetting } from '../types';


export type KioskSettingBasicInfoFormData = {
	name: string,
	description?: string,
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


export function useKioskSettingEdit(setting: KioskSetting | undefined, options?: { onUpdateSuccess?: () => void }) {
	const { dispatchMethod, result } = useServiceLayer(kioskSettingCrudService.update);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_settings.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: options?.onUpdateSuccess,
	});

	const submit = useCallback(
		(updates: Omit<KioskSettingUpdateFormData, 'id' | 'etag'>) => {
			if (!setting) return;
			dispatchMethod({ id: setting.id, etag: setting.etag, ...updates });
		},
		[dispatchMethod, setting],
	);

	return { isSubmitting: result.isPending, handleSubmit: submit };
}
