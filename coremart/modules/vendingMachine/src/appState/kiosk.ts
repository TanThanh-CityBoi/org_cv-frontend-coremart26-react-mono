import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listKiosks,
	getKiosk,
	createKiosk,
	updateKiosk,
	deleteKiosk,
	setArchivedKiosk,
	KioskState,
	initialKioskState,
	searchKioskLogs,
	fetchKioskStocks,
	createKioskStock,
	bulkCreateKioskStocks,
	updateKioskStock,
	deleteKioskStock,
	updateKioskPositions,
} from '@/features/kiosks/kioskSlice';


const STATE_KEY = 'kiosk';

export const kioskReducer = {
	[STATE_KEY]: reducer,
};

export const kioskActions = {
	listKiosks,
	getKiosk,
	createKiosk,
	updateKiosk,
	deleteKiosk,
	setArchivedKiosk,
	searchKioskLogs,
	fetchKioskStocks,
	createKioskStock,
	bulkCreateKioskStocks,
	updateKioskStock,
	deleteKioskStock,
	updateKioskPositions,
	...actions,
};

export const selectKioskState = (state: { [STATE_KEY]?: KioskState }) => state?.[STATE_KEY] ?? initialKioskState;

export const selectKioskList = createSelector(
	selectKioskState,
	(state) => state.list,
);

export const selectKioskDetail = createSelector(
	selectKioskState,
	(state) => state.detail,
);

export const selectCreateKiosk = createSelector(
	selectKioskState,
	(state) => state.create,
);

export const selectUpdateKiosk = createSelector(
	selectKioskState,
	(state) => state.update,
);

export const selectDeleteKiosk = createSelector(
	selectKioskState,
	(state) => state.delete,
);

export const selectSetArchivedKiosk = createSelector(
	selectKioskState,
	(state) => state.archive,
);

export const selectKioskLogs = createSelector(
	selectKioskState,
	(state) => state.kioskLogs,
);

export const selectKioskStock = createSelector(
	selectKioskState,
	(state) => state.kioskStock,
);

export const selectKioskStockQuery = createSelector(
	selectKioskState,
	(state) => state.kioskStockQuery,
);

export const selectCreateKioskStock = createSelector(
	selectKioskState,
	(state) => state.createKioskStock,
);

export const selectBulkCreateKioskStocks = createSelector(
	selectKioskState,
	(state) => state.bulkCreateKioskStocks,
);

export const selectKioskStockUpdate = createSelector(
	selectKioskState,
	(state) => state.kioskStockUpdate,
);

export const selectKioskStockDelete = createSelector(
	selectKioskState,
	(state) => state.kioskStockDelete,
);

export const selectKioskPositionsUpdate = createSelector(
	selectKioskState,
	(state) => state.kioskPositionsUpdate,
);