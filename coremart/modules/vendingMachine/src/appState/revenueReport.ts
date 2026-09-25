import { createSelector } from '@reduxjs/toolkit';

import {
	fetchRevenueByCategory,
	fetchRevenueByHour,
	fetchRevenueByKiosk,
	fetchRevenueByKioskChart,
	fetchRevenueByOrderTime,
	fetchRevenueByPaymentMethod,
	fetchRevenueByPaymentMethodChart,
	fetchRevenueByProduct,
	fetchRevenueByProductChart,
	fetchRevenueByCategoryChart,
	fetchRevenueOverview,
	initialRevenueReportState,
	type RevenueReportState,
	reducer,
	setReportKioskIds,
	fetchRevenueTimeSeriesChart,
} from '@/features/reports/business/revenueReportSlice';


const STATE_KEY = 'revenueReport';

export const revenueReportReducer = {
	[STATE_KEY]: reducer,
};

export const revenueReportActions = {
	fetchRevenueOverview,
	fetchRevenueByHour,
	fetchRevenueByOrderTime,
	fetchRevenueTimeSeriesChart,
	fetchRevenueByKiosk,
	fetchRevenueByKioskChart,
	fetchRevenueByProduct,
	fetchRevenueByProductChart,
	fetchRevenueByCategory,
	fetchRevenueByCategoryChart,
	fetchRevenueByPaymentMethod,
	fetchRevenueByPaymentMethodChart,
	setReportKioskIds,
};



export const selectRevenueReportState = (state: { [STATE_KEY]?: RevenueReportState }) =>
	state?.[STATE_KEY] ?? initialRevenueReportState;


export const selectRevenueOverview = createSelector(selectRevenueReportState, (s) => s.overview);

export const selectRevenueByHour = createSelector(selectRevenueReportState, (s) => s.byHour);

export const selectRevenueByHourOverview = createSelector(
	selectRevenueByHour,
	(s) => s.overview,
);

export const selectRevenueByOrderTime = createSelector(selectRevenueReportState, (s) => s.byOrderTime);

export const selectRevenueTimeSeriesChart = createSelector(selectRevenueReportState, (s) => s.timeSeriesChart);

export const selectRevenueByKiosk = createSelector(selectRevenueReportState, (s) => s.byKiosk);

export const selectRevenueByKioskChart = createSelector(selectRevenueReportState, (s) => s.byKioskChart);

export const selectRevenueByKioskOverview = createSelector(
	selectRevenueByKiosk,
	(s) => s.overview,
);

export const selectRevenueByProduct = createSelector(selectRevenueReportState, (s) => s.byProduct);

export const selectRevenueByProductChart = createSelector(selectRevenueReportState, (s) => s.byProductChart);

export const selectRevenueByProductOverview = createSelector(
	selectRevenueByProduct,
	(s) => s.overview,
);

export const selectRevenueByCategory = createSelector(selectRevenueReportState, (s) => s.byCategory);

export const selectRevenueByCategoryChart = createSelector(selectRevenueReportState, (s) => s.byCategoryChart);

export const selectRevenueByCategoryOverview = createSelector(
	selectRevenueByCategory,
	(s) => s.overview,
);

export const selectRevenueByPaymentMethod = createSelector(selectRevenueReportState, (s) => s.byPaymentMethod);

export const selectRevenueByPaymentMethodChart = createSelector(
	selectRevenueReportState,
	(s) => s.byPaymentMethodChart,
);

export const selectRevenueByPaymentMethodOverview = createSelector(
	selectRevenueByPaymentMethod,
	(s) => s.overview,
);

export const selectReportKioskIds = createSelector(selectRevenueReportState, (s) => s.reportKioskIds);
