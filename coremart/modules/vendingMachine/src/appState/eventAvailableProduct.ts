import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	searchEventAvailableProducts,
	EventAvailableProductState,
	initialEventAvailableProductState,
} from '@/features/events/eventAvailableProductSlice';


const STATE_KEY = 'eventAvailableProduct';

export const eventAvailableProductReducer = {
	[STATE_KEY]: reducer,
};

export const eventAvailableProductActions = {
	searchEventAvailableProducts,
};

export const selectEventAvailableProductState = (state: { [STATE_KEY]?: EventAvailableProductState }) =>
	state?.[STATE_KEY] ?? initialEventAvailableProductState;

export const selectEventAvailableProductList = createSelector(
	selectEventAvailableProductState,
	(s) => s.list,
);

