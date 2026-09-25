/* eslint-disable max-lines-per-function */


import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';


import { basePagedReduxState, PagedReduxState, PageQuery, type PagedSearchResponse, type ReportTimeQuery } from '@/types';

import { operationReportService } from './operationReportService';

import type {
	KioskAnalyticsQuery,
	KioskStateAnalytic,
	KioskStats,
	KioskVisitor,
	KioskVisitorQuery,
	KioskWarning,
	KioskWarningQuery,
	LowStockWarning,
	OperationStats,
} from './type';


export const SLICE_NAME = 'vendingMachine.operationReport';
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_BUCKET_PAGE_SIZE = 30;


export type OperationReportState = {
	kioskStats: ReduxActionState<KioskStats>,
	operationalStats: ReduxActionState<OperationStats>,
	lowStockWarnings: PagedReduxState<LowStockWarning>,
	kioskVisitors: PagedReduxState<KioskVisitor>,
	kioskAnalytics: PagedReduxState<KioskStateAnalytic>,
	kioskWarnings: PagedReduxState<KioskWarning>,
};

export const initialOperationReportState: OperationReportState = {
	kioskStats: {...baseReduxActionState},
	operationalStats: {...baseReduxActionState},
	lowStockWarnings: {...basePagedReduxState(DEFAULT_PAGE_SIZE)},
	kioskVisitors: {...basePagedReduxState(DEFAULT_BUCKET_PAGE_SIZE)},
	kioskAnalytics: {...basePagedReduxState(DEFAULT_BUCKET_PAGE_SIZE)},
	kioskWarnings: {...basePagedReduxState(DEFAULT_PAGE_SIZE)},
};


export const fetchOperationalStats = createAsyncThunk<
	OperationStats,
	ReportTimeQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchOperationalStats`,
	async (query, { rejectWithValue }) => {
		try {
			return await operationReportService.getOperationalStats(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load operational stats';
			return rejectWithValue(message);
		}
	},
);


export const fetchKioskStats = createAsyncThunk<
	KioskStats,
	ReportTimeQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchKioskStats`,
	async (query, { rejectWithValue }) => {
		try {
			return await operationReportService.getKioskStats(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load kiosk stats';
			return rejectWithValue(message);
		}
	},
);


export const fetchLowStockWarnings = createAsyncThunk<
	PagedSearchResponse<LowStockWarning>,
	PageQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchLowStockWarnings`,
	async (params, { rejectWithValue }) => {
		try {
			return await operationReportService.getLowStockWarnings({
				page: params.page,
				size: params.size,
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load low stock warnings';
			return rejectWithValue(message);
		}
	},
);


export const fetchKioskVisitors = createAsyncThunk<
	PagedSearchResponse<KioskVisitor>,
	KioskVisitorQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchKioskVisitors`,
	async (query, { rejectWithValue }) => {
		try {
			return await operationReportService.getKioskVisitors(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load kiosk visitors';
			return rejectWithValue(message);
		}
	},
);


export const fetchKioskAnalytics = createAsyncThunk<
	PagedSearchResponse<KioskStateAnalytic>,
	KioskAnalyticsQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchKioskAnalytics`,
	async (query, { rejectWithValue }) => {
		try {
			return await operationReportService.getKioskAnalytics(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load kiosk analytics';
			return rejectWithValue(message);
		}
	},
);


export const fetchKioskWarnings = createAsyncThunk<
	PagedSearchResponse<KioskWarning>,
	KioskWarningQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchKioskWarnings`,
	async (params, { rejectWithValue }) => {
		try {
			return await operationReportService.getKioskWarnings({
				fields: ['kiosk', 'createdAt', 'description', 'level', 'status', 'etag', 'id', 'kioskRef'],
				...params,
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load kiosk warnings';
			return rejectWithValue(message);
		}
	},
);


const operationReportSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialOperationReportState,
	reducers: {
		//
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchOperationalStats.pending, (state) => {
				state.operationalStats.status = 'pending';
				state.operationalStats.error = null;
			})
			.addCase(fetchOperationalStats.fulfilled, (state, action) => {
				state.operationalStats.status = 'success';
				state.operationalStats.data = action.payload;
				state.operationalStats.error = null;
			})
			.addCase(fetchOperationalStats.rejected, (state, action) => {
				state.operationalStats.status = 'error';
				state.operationalStats.error = action.payload || 'Failed to load operational stats';
				state.operationalStats.data = undefined;
			})
			.addCase(fetchKioskStats.pending, (state) => {
				state.kioskStats.status = 'pending';
				state.kioskStats.error = null;
			})
			.addCase(fetchKioskStats.fulfilled, (state, action) => {
				state.kioskStats.status = 'success';
				state.kioskStats.data = action.payload;
				state.kioskStats.error = null;
			})
			.addCase(fetchKioskStats.rejected, (state, action) => {
				state.kioskStats.status = 'error';
				state.kioskStats.error = action.payload || 'Failed to load kiosk stats';
				state.kioskStats.data = undefined;
			})
			.addCase(fetchLowStockWarnings.pending, (state) => {
				state.lowStockWarnings.status = 'pending';
				state.lowStockWarnings.error = null;
			})
			.addCase(fetchLowStockWarnings.fulfilled, (state, action) => {
				state.lowStockWarnings.status = 'success';
				state.lowStockWarnings.items = action.payload.items;
				state.lowStockWarnings.total = action.payload.total;
				state.lowStockWarnings.page = action.payload.page;
				state.lowStockWarnings.size = action.payload.size;
				state.lowStockWarnings.error = null;
			})
			.addCase(fetchLowStockWarnings.rejected, (state, action) => {
				state.lowStockWarnings.status = 'error';
				state.lowStockWarnings.error = action.payload || 'Failed to load low stock warnings';
				state.lowStockWarnings.items = [];
				state.lowStockWarnings.total = 0;
				state.lowStockWarnings.page = 0;
				state.lowStockWarnings.size = DEFAULT_PAGE_SIZE;
			})
			.addCase(fetchKioskVisitors.pending, (state) => {
				state.kioskVisitors.status = 'pending';
				state.kioskVisitors.error = null;
			})
			.addCase(fetchKioskVisitors.fulfilled, (state, action) => {
				state.kioskVisitors.status = 'success';
				state.kioskVisitors.items = action.payload.items;
				state.kioskVisitors.total = action.payload.total;
				state.kioskVisitors.page = action.payload.page;
				state.kioskVisitors.size = action.payload.size;
				state.kioskVisitors.error = null;
			})
			.addCase(fetchKioskVisitors.rejected, (state, action) => {
				state.kioskVisitors.status = 'error';
				state.kioskVisitors.error = action.payload || 'Failed to load kiosk visitors';
				state.kioskVisitors.items = [];
			})
			.addCase(fetchKioskAnalytics.pending, (state) => {
				state.kioskAnalytics.status = 'pending';
				state.kioskAnalytics.error = null;
			})
			.addCase(fetchKioskAnalytics.fulfilled, (state, action) => {
				state.kioskAnalytics.status = 'success';
				state.kioskAnalytics.items = action.payload.items;
				state.kioskAnalytics.total = action.payload.total;
				state.kioskAnalytics.page = action.payload.page;
				state.kioskAnalytics.size = action.payload.size;
				state.kioskAnalytics.error = null;
			})
			.addCase(fetchKioskAnalytics.rejected, (state, action) => {
				state.kioskAnalytics.status = 'error';
				state.kioskAnalytics.error = action.payload || 'Failed to load kiosk analytics';
				state.kioskAnalytics.items = [];
			})
			.addCase(fetchKioskWarnings.pending, (state) => {
				state.kioskWarnings.status = 'pending';
				state.kioskWarnings.error = null;
			})
			.addCase(fetchKioskWarnings.fulfilled, (state, action) => {
				state.kioskWarnings.status = 'success';
				state.kioskWarnings.items = action.payload.items;
				state.kioskWarnings.total = action.payload.total;
				state.kioskWarnings.page = action.payload.page;
				state.kioskWarnings.size = action.payload.size;
				state.kioskWarnings.error = null;
			})
			.addCase(fetchKioskWarnings.rejected, (state, action) => {
				state.kioskWarnings.status = 'error';
				state.kioskWarnings.error = action.payload || 'Failed to load kiosk warnings';
				state.kioskWarnings.items = [];
			});
	},
});

export const { reducer, actions: operationReportUiActions } = operationReportSlice;
