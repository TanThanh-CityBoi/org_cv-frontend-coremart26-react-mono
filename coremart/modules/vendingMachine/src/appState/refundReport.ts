import { createSelector } from '@reduxjs/toolkit';

import {
	fetchRefundByKiosk,
	fetchRefundByPaymentMethod,
	fetchRefundByProduct,
	fetchRefundOrders,
	fetchRefundOverview,
	initialRefundReportState,
	type RefundReportState,
	reducer,
} from '@/features/reports/business/refundReportSlice';


const STATE_KEY = 'refundReport';

export const refundReportReducer = {
	[STATE_KEY]: reducer,
};

export const refundReportActions = {
	fetchRefundOverview,
	fetchRefundByKiosk,
	fetchRefundByPaymentMethod,
	fetchRefundByProduct,
	fetchRefundOrders,
};

export const selectRefundReportState = (state: { [STATE_KEY]?: RefundReportState }) =>
	state?.[STATE_KEY] ?? initialRefundReportState;

export const selectRefundOverview = createSelector(selectRefundReportState, (s) => s.overview);
export const selectRefundByKiosk = createSelector(selectRefundReportState, (s) => s.byKiosk);
export const selectRefundByPaymentMethod = createSelector(selectRefundReportState, (s) => s.byPaymentMethod);
export const selectRefundByProduct = createSelector(selectRefundReportState, (s) => s.byProduct);
export const selectRefundOrders = createSelector(selectRefundReportState, (s) => s.orders);
