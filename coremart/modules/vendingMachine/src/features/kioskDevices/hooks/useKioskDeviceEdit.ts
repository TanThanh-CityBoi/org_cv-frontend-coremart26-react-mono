import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskDeviceStoreService } from '../kioskDeviceStoreService';
import { KioskDevice } from '../types';



export function useKioskDeviceEdit(
	kioskDevice: KioskDevice | undefined,
	options?: { onUpdateSuccess?: () => void },
) {
	const { dispatchMethod, result } = useServiceLayer(kioskDeviceStoreService.update);
	const onUpdateSuccess = options?.onUpdateSuccess;

	const handleSubmit = useCallback(
		(updates: Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>>) => {
			if (kioskDevice) {
				dispatchMethod({ id: kioskDevice.id, etag: kioskDevice.etag, updates });
			}
		},
		[kioskDevice, dispatchMethod],
	);

	// The slice re-dispatched `listKioskDevices` here; the list now owns its own service-layer
	// result, so refreshing it is the caller's job via `onUpdateSuccess`.
	useMutationOutcome(result, {
		successKey: () => 'device.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: () => onUpdateSuccess?.(),
	});

	return { isSubmitting: result.isPending, handleSubmit };
}
