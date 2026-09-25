import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	initialKioskMediaState,
	KioskMediaState,
	listKioskMedias,
	reducer,
} from '@/features/mediaPlaylist/kioskMediaSlice';


const STATE_KEY = 'kioskMedia';

export const kioskMediaReducer = {
	[STATE_KEY]: reducer,
};

export const kioskMediaActions = {
	listKioskMedias,
	...actions,
};

export const selectKioskMediaState = (state: { [STATE_KEY]?: KioskMediaState }) =>
	state?.[STATE_KEY] ?? initialKioskMediaState;

export const selectKioskMediaList = createSelector(
	selectKioskMediaState,
	(s) => s.list,
);

