import { createSelector } from '@reduxjs/toolkit';

import {
	actions,
	getOrder,
	listOrders,
	listOrdersByChainKey,
	refundOrderItems,
	reducer,
	initialVendingOrderState,
	VendingOrderState,
} from '@/features/orders/orderSlice';


const STATE_KEY = 'vendingOrder';

export const vendingOrderReducer = {
	[STATE_KEY]: reducer,
};

export const vendingOrderActions = {
	listOrders,
	listOrdersByChainKey,
	getOrder,
	refundOrderItems,
	...actions,
};

export const selectVendingOrderState = (state: { [STATE_KEY]?: VendingOrderState }) =>
	state?.[STATE_KEY] ?? initialVendingOrderState;

export const selectVendingOrderList = createSelector(
	selectVendingOrderState,
	(state) => state.list,
);

export const selectVendingOrderDetail = createSelector(
	selectVendingOrderState,
	(state) => state.detail,
);

export const selectRefundOrderItemsState = createSelector(
	selectVendingOrderState,
	(state) => state.refund,
);

export const selectChainGroupOrderList = createSelector(
	selectVendingOrderState,
	(state) => state.chainGroupList,
);

