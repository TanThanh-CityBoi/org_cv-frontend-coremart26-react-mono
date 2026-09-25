import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskDeviceStoreService } from '../kioskDeviceStoreService';
import { KioskDevice } from '../types';



export interface KioskDeviceCreateFormData {
	name: string;
	code?: string;
	description?: string;
	status: KioskDevice['status'];
	deviceType?: KioskDevice['deviceType'];
}

export function kioskDeviceToCreateFormValues(device: KioskDevice): KioskDeviceCreateFormData {
	return {
		name: device.name,
		code: device.code,
		description: device.description,
		status: device.status,
		deviceType: device.deviceType,
	};
}

export function formDataToKioskDeviceUpdatePayload(
	data: KioskDeviceCreateFormData,
): Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>> {
	return {
		name: data.name,
		description: data.description,
		status: data.status,
		deviceType: data.deviceType,
	};
}


export function useKioskDeviceCreate() {
	const navigate = useNavigate();
	const location = useLocation();

	const { dispatchMethod, result } = useServiceLayer<KioskDevice>(kioskDeviceStoreService.create);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskDeviceCreateFormData) => {
		dispatchMethod(data as Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>);
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'device.messages.create_success',
		successParams: () => ({ name: result.data?.name }),
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
