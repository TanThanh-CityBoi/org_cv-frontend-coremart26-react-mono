import { createSelector } from '@reduxjs/toolkit';

import {
	fetchKioskAnalytics,
	fetchKioskStats,
	fetchKioskVisitors,
	fetchKioskWarnings,
	fetchLowStockWarnings,
	fetchOperationalStats,
	initialOperationReportState,
	OperationReportState,
	reducer,
} from '@/features/reports/operations/operationReportSlice';


const STATE_KEY = 'operationReport';

export const operationReportReducer = {
	[STATE_KEY]: reducer,
};

export const operationReportActions = {
	fetchOperationalStats,
	fetchKioskStats,
	fetchLowStockWarnings,
	fetchKioskVisitors,
	fetchKioskAnalytics,
	fetchKioskWarnings,
};



export const selectOperationReportState = (state: { [STATE_KEY]?: OperationReportState }) =>
	state?.[STATE_KEY] ?? initialOperationReportState;


export const selectOperationalStats = createSelector(selectOperationReportState, (s) => s.operationalStats);

export const selectKioskStats = createSelector(selectOperationReportState, (s) => s.kioskStats);

export const selectLowStockWarnings = createSelector(selectOperationReportState, (s) => s.lowStockWarnings);

export const selectKioskVisitors = createSelector(selectOperationReportState, (s) => s.kioskVisitors);

export const selectKioskAnalytics = createSelector(selectOperationReportState, (s) => s.kioskAnalytics);

export const selectKioskWarnings = createSelector(selectOperationReportState, (s) => s.kioskWarnings);