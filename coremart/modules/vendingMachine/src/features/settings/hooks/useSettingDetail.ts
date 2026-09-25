import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { settingStoreService } from '../settingStoreService';

import type { Setting } from '../types';


export function useSettingDetail(settingId?: string) {
	const { dispatchMethod, result } = useServiceLayer<Setting>(settingStoreService.getById);

	React.useEffect(() => {
		if (settingId) {
			dispatchMethod({ id: settingId });
		}
	}, [settingId, dispatchMethod]);

	return {
		// `useServiceLayer` yields `null` before the first call; consumers expect `undefined`.
		setting: result.data ?? undefined,
		isLoading: result.isPending || result.doneAt == null,
	};
}
