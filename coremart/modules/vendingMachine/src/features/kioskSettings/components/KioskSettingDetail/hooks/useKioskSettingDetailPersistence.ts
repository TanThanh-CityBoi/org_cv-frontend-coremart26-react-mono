import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../../../common/hooks/useMutationOutcome';
import { KIOSK_SETTING_DETAIL_FIELDS, kioskSettingCrudService } from '../../../kioskSettingService';

import type { KioskSettingUpdateFormData } from '../../../hooks/kioskSettingPayloads';
import type { KioskSetting } from '../../../types';


export type UseKioskSettingDetailPersistenceOptions = {
	onUpdateSuccess?: () => void,
	onDeleteSuccess?: () => void,
};

export function useKioskSettingDetailPersistence(
	setting: KioskSetting | undefined,
	options?: UseKioskSettingDetailPersistenceOptions,
) {
	const navigate = useNavigate();
	const callbacksRef = useRef(options);

	callbacksRef.current = options;

	const { dispatchMethod: refetch } = useServiceLayer(kioskSettingCrudService.getById);
	const update = useServiceLayer(kioskSettingCrudService.update);
	const remove = useServiceLayer(kioskSettingCrudService.delete);

	const refreshDetail = useCallback(() => {
		if (!setting?.id) return;
		refetch({ id: setting.id, fields: KIOSK_SETTING_DETAIL_FIELDS });
	}, [refetch, setting?.id]);

	useMutationOutcome(update.result, {
		successKey: () => 'kiosk_settings.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: () => {
			refreshDetail();
			callbacksRef.current?.onUpdateSuccess?.();
		},
	});

	useMutationOutcome(remove.result, {
		successKey: () => 'messages.delete.success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => {
			callbacksRef.current?.onDeleteSuccess?.();
			navigate('../kiosk-settings');
		},
	});

	const onSaveSettings = useCallback((updates: Partial<Omit<KioskSettingUpdateFormData, 'id' | 'etag'>>) => {
		if (!setting) return;
		update.dispatchMethod({ id: setting.id, etag: setting.etag, ...updates });
	}, [update, setting]);

	const onDelete = useCallback(() => {
		if (!setting) return;
		remove.dispatchMethod({ id: setting.id });
	}, [remove, setting]);

	return {
		onSaveSettings,
		onDelete,
		isSaveSubmitting: update.result.isPending,
	};
}
