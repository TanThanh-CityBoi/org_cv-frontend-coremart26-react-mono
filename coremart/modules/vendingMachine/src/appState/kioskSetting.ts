import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKiosksInSetting,
	searchKioskSettings,
	getKioskSetting,
	createKioskSetting,
	updateKioskSetting,
	deleteKioskSetting,
	setArchivedKioskSetting,
	manageKioskSettingKiosks,
	KioskSettingState,
	initialKioskSettingState,
} from '@/features/kioskSettings/kioskSettingSlice';


const STATE_KEY = 'kioskSetting';

export const kioskSettingReducer = { [STATE_KEY]: reducer };

export const kioskSettingActions = {
	listKiosksInSetting,
	searchKioskSettings,
	getKioskSetting,
	createKioskSetting,
	updateKioskSetting,
	deleteKioskSetting,
	setArchivedKioskSetting,
	manageKioskSettingKiosks,
	...actions,
};

export const selectKioskSettingState = (state: { [STATE_KEY]?: KioskSettingState }) =>
	state?.[STATE_KEY] ?? initialKioskSettingState;

export const selectKioskSettingList = createSelector(
	selectKioskSettingState,
	(s) => s.list,
);

export const selectKioskListInSetting = createSelector(
	selectKioskSettingState,
	(s) => s.kioskListInSetting,
);

export const selectKioskSettingDetail = createSelector(
	selectKioskSettingState,
	(s) => s.detail,
);

export const selectCreateKioskSetting = createSelector(
	selectKioskSettingState,
	(s) => s.create,
);

export const selectUpdateKioskSetting = createSelector(
	selectKioskSettingState,
	(s) => s.update,
);

export const selectDeleteKioskSetting = createSelector(
	selectKioskSettingState,
	(s) => s.delete,
);

export const selectKioskSettingArchiveOutcome = createSelector(
	selectKioskSettingState,
	(s) => s.archive,
);

export const selectManageKioskSettingKiosksOutcome = createSelector(
	selectKioskSettingState,
	(s) => s.manageKioskSettingKiosks,
);
