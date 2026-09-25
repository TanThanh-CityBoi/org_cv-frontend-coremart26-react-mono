import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskSettingActions, selectKioskSettingDetail } from '@/appState';
import { KIOSK_SETTING_DETAIL_FIELDS } from '@/features/kioskSettings/kioskSettingSlice';


export function useKioskSettingDetail(settingId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectKioskSettingDetail);

	React.useEffect(() => {
		if (settingId) {
			dispatch(kioskSettingActions.getKioskSetting({
				id: settingId,
				fields: KIOSK_SETTING_DETAIL_FIELDS,
			}));
		}
	}, [settingId, dispatch]);

	return {
		setting: detail.data,
		isLoading: Boolean(settingId) && (detail.status === 'pending' || detail.status === 'idle'),
	};
}
