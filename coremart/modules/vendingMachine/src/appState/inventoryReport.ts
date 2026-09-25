import { createSelector } from '@reduxjs/toolkit';

import {
	fetchInventoryChartProducts,
	fetchInventoryProducts,
	initialInventoryReportState,
	type InventoryReportState,
	reducer,
} from '@/features/reports/operations/inventoryReportSlice';


const STATE_KEY = 'inventoryReport';

export const inventoryReportReducer = {
	[STATE_KEY]: reducer,
};

export const inventoryReportActions = {
	fetchInventoryProducts,
	fetchInventoryChartProducts,
};

export const selectInventoryReportState = (state: { [STATE_KEY]?: InventoryReportState }) =>
	state?.[STATE_KEY] ?? initialInventoryReportState;

export const selectInventoryProducts = createSelector(selectInventoryReportState, (s) => s.products);
export const selectInventoryChartProducts = createSelector(selectInventoryReportState, (s) => s.chartProducts);
