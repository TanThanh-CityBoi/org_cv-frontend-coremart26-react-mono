import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { kioskDeviceStoreService } from '../kioskDeviceStoreService';

import type { KioskDevice } from '../types';


export function useKioskDeviceDetail(kioskDeviceId?: string) {
	const { dispatchMethod, result } = useServiceLayer<KioskDevice | undefined>(
		kioskDeviceStoreService.getById,
	);

	React.useEffect(() => {
		if (kioskDeviceId) {
			dispatchMethod({ id: kioskDeviceId });
		}
	}, [kioskDeviceId, dispatchMethod]);

	return {
		// `useServiceLayer` yields `null` before the first call; consumers expect `undefined`.
		kioskDevice: result.data ?? undefined,
		isLoading: result.isPending || result.doneAt == null,
	};
}
