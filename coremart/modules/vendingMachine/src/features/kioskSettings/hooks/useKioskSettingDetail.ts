import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { KIOSK_SETTING_DETAIL_FIELDS, kioskSettingCrudService } from '../kioskSettingService';
import { KioskSetting } from '../types';


type GetOneResponse = { item: KioskSetting };


export function useKioskSettingDetail(settingId?: string) {
	const { dispatchMethod, result } = useServiceLayer<GetOneResponse>(kioskSettingCrudService.getById);

	React.useEffect(() => {
		if (settingId) {
			dispatchMethod({ id: settingId, fields: KIOSK_SETTING_DETAIL_FIELDS });
		}
	}, [settingId, dispatchMethod]);

	return {
		setting: result.data?.item,
		isLoading: Boolean(settingId) && result.isPending,
	};
}
