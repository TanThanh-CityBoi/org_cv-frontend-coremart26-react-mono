import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	searchKioskAvailableProducts,
	KioskAvailableProductState,
	initialKioskAvailableProductState,
} from '@/features/kioskProducts/kioskAvailableProductSlice';


const STATE_KEY = 'kioskAvailableProduct';

export const kioskAvailableProductReducer = {
	[STATE_KEY]: reducer,
};

export const kioskAvailableProductActions = {
	searchKioskAvailableProducts,
};

export const selectKioskAvailableProductState = (state: { [STATE_KEY]?: KioskAvailableProductState }) =>
	state?.[STATE_KEY] ?? initialKioskAvailableProductState;

export const selectKioskAvailableProductList = createSelector(
	selectKioskAvailableProductState,
	(s) => s.list,
);

