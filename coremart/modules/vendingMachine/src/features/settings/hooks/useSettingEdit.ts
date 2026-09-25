import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { settingStoreService } from '../settingStoreService';
import { Setting } from '../types';



export type SettingUpdateBody = {
	etag: string,
	name?: string,
	description?: string,
	config?: Record<string, unknown> | null,
};

export type SettingUpdatePayload = { id: string, body: SettingUpdateBody };

export function useSettingEdit(setting: Setting | undefined, options?: { onUpdateSuccess?: () => void }) {
	const { dispatchMethod, result } = useServiceLayer(settingStoreService.update);
	const { dispatchMethod: reloadSetting } = useServiceLayer(settingStoreService.getById);
	const settingId = setting?.id;
	const onUpdateSuccess = options?.onUpdateSuccess;

	const handleSubmit = useCallback(
		(updates: Omit<SettingUpdateBody, 'etag'>) => {
			if (setting) {
				dispatchMethod({ id: setting.id, body: { etag: setting.etag, ...updates } });
			}
		},
		[setting, dispatchMethod],
	);

	useMutationOutcome(result, {
		successKey: () => 'settings.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: () => {
			onUpdateSuccess?.();
			// The detail view reads a separate service-layer result, so refresh it explicitly.
			if (settingId) {
				reloadSetting({ id: settingId });
			}
		},
	});

	return { isSubmitting: result.isPending, handleSubmit };
}
