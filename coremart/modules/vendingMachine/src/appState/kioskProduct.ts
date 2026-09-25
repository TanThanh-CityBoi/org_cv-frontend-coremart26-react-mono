import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	searchKioskProducts,
	KioskProductState,
	initialKioskProductState,
} from '@/features/kioskProducts/kioskProductSlice';


const STATE_KEY = 'kioskProduct';

export const kioskProductReducer = {
	[STATE_KEY]: reducer,
};

export const kioskProductActions = {
	searchKioskProducts,
};

export const selectKioskProductState = (state: { [STATE_KEY]?: KioskProductState }) =>
	state?.[STATE_KEY] ?? initialKioskProductState;

export const selectKioskProductList = createSelector(
	selectKioskProductState,
	(state) => state.list,
);

