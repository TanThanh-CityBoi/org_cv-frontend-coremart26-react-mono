import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { kioskDeviceStoreService } from '../kioskDeviceStoreService';

import type { KioskDevice } from '../types';


export function useKioskDeviceList() {
	const { dispatchMethod, result } = useServiceLayer<KioskDevice[]>(kioskDeviceStoreService.list);

	const handleRefresh = React.useCallback(() => dispatchMethod({}), [dispatchMethod]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		kioskDevices: result.data ?? [],
		isLoadingList: result.isPending || result.doneAt == null,
		handleRefresh,
	};
}
