/* eslint-disable max-lines-per-function */
import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';


import {
	revenueReportService,
	REVENUE_REPORT_DEFAULT_PAGE_SIZE,
} from './revenueReportService';

import type {
	ReportOverview,
	RevenueOverview,
	RevenueReport,
	RevenueReportByCategory,
	RevenueReportByHour,
	RevenueReportByKiosk,
	RevenueReportByOrderTime,
	RevenueReportByPaymentMethod,
	RevenueReportByProduct,
} from './type';
import type {
	RevenueReportByCategoryQuery,
	RevenueReportByHourQuery,
	RevenueReportByKioskQuery,
	RevenueReportByOrderTimeQuery,
	RevenueReportByPaymentMethodQuery,
	RevenueReportByProductQuery,
	RevenueReportOverviewQuery,
} from '@/types';


export const SLICE_NAME = 'vendingMachine.revenueReport';

/**
 * Merged paged state for revenue report slices that have both a list of items and an overview.
 * Extends the `PagedReduxState` concept with an `overview` field.
 */
export type PagedReportState<R> = {
	status: 'idle' | 'pending' | 'success' | 'error';
	error: string | null;
	overview: ReportOverview<R> | null;
	items: R[] | null;
	total: number;
	page: number;
	size: number;
};

const emptyReportState = <R>(): PagedReportState<R> => ({
	status: 'idle',
	error: null,
	overview: null,
	items: [],
	total: 0,
	page: 0,
	size: REVENUE_REPORT_DEFAULT_PAGE_SIZE,
});

export type RevenueReportState = {
	overview: ReduxActionState<RevenueOverview>,
	byHour: PagedReportState<RevenueReportByHour>;
	byOrderTime: PagedReportState<RevenueReportByOrderTime>;
	timeSeriesChart: PagedReportState<RevenueReportByOrderTime>;
	byKiosk: PagedReportState<RevenueReportByKiosk>;
	byKioskChart: PagedReportState<RevenueReportByKiosk>;
	byProduct: PagedReportState<RevenueReportByProduct>;
	byProductChart: PagedReportState<RevenueReportByProduct>;
	byCategory: PagedReportState<RevenueReportByCategory>;
	byCategoryChart: PagedReportState<RevenueReportByCategory>;
	byPaymentMethod: PagedReportState<RevenueReportByPaymentMethod>;
	byPaymentMethodChart: PagedReportState<RevenueReportByPaymentMethod>;
	/** Kiosk đã chọn trên filter báo cáo doanh thu (sau Apply). */
	reportKioskIds: string[];
};

export const initialRevenueReportState: RevenueReportState = {
	overview: { ...baseReduxActionState },
	byHour: emptyReportState(),
	byOrderTime: emptyReportState(),
	timeSeriesChart: emptyReportState(),
	byKiosk: emptyReportState(),
	byKioskChart: emptyReportState(),
	byProduct: emptyReportState(),
	byProductChart: emptyReportState(),
	byCategory: emptyReportState(),
	byCategoryChart: emptyReportState(),
	byPaymentMethod: emptyReportState(),
	byPaymentMethodChart: emptyReportState(),
	reportKioskIds: [],
};


export const fetchRevenueOverview = createAsyncThunk<
	RevenueOverview,
	RevenueReportOverviewQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueOverview`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getOverview(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load revenue overview';
			return rejectWithValue(message);
		}
	},
);

export const fetchRevenueByHour = createAsyncThunk<
	RevenueReport<RevenueReportByHour>,
	RevenueReportByHourQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByHour`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByHour(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load revenue report by hour';
			return rejectWithValue(message);
		}
	},
);

export const fetchRevenueByOrderTime = createAsyncThunk<
	RevenueReport<RevenueReportByOrderTime>,
	RevenueReportByOrderTimeQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByOrderTime`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByOrderTime(query);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to load revenue report by order time';
			return rejectWithValue(msg);
		}
	},
);

export const fetchRevenueTimeSeriesChart = createAsyncThunk<
	RevenueReport<RevenueReportByOrderTime>,
	RevenueReportByOrderTimeQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueTimeSeriesChart`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByOrderTime(query);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to load revenue report by order time';
			return rejectWithValue(msg);
		}
	},
);

export const fetchRevenueByKiosk = createAsyncThunk<
	RevenueReport<RevenueReportByKiosk>,
	RevenueReportByKioskQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByKiosk`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByKiosk(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load revenue report by kiosk';
			return rejectWithValue(message);
		}
	},
);

export const fetchRevenueByKioskChart = createAsyncThunk<
	RevenueReport<RevenueReportByKiosk>,
	RevenueReportByKioskQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByKioskChart`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByKiosk(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load revenue report by kiosk chart';
			return rejectWithValue(message);
		}
	},
);

export const fetchRevenueByProduct = createAsyncThunk<
	RevenueReport<RevenueReportByProduct>,
	RevenueReportByProductQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByProduct`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByProduct(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load revenue report by product';
			return rejectWithValue(message);
		}
	},
);

export const fetchRevenueByCategory = createAsyncThunk<
	RevenueReport<RevenueReportByCategory>,
	RevenueReportByCategoryQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByCategory`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByCategory(query);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to load revenue report by category';
			return rejectWithValue(msg);
		}
	},
);

export const fetchRevenueByProductChart = createAsyncThunk<
	RevenueReport<RevenueReportByProduct>,
	RevenueReportByProductQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByProductChart`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByProduct(query);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load revenue report by product chart';
			return rejectWithValue(message);
		}
	},
);

export const fetchRevenueByCategoryChart = createAsyncThunk<
	RevenueReport<RevenueReportByCategory>,
	RevenueReportByCategoryQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByCategoryChart`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByCategory(query);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to load revenue report by category chart';
			return rejectWithValue(msg);
		}
	},
);

export const fetchRevenueByPaymentMethod = createAsyncThunk<
	RevenueReport<RevenueReportByPaymentMethod>,
	RevenueReportByPaymentMethodQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByPaymentMethod`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByPaymentMethod(query);
		}
		catch (error) {
			const msg =
				error instanceof Error ? error.message : 'Failed to load revenue report by payment method';
			return rejectWithValue(msg);
		}
	},
);

export const fetchRevenueByPaymentMethodChart = createAsyncThunk<
	RevenueReport<RevenueReportByPaymentMethod>,
	RevenueReportByPaymentMethodQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRevenueByPaymentMethodChart`,
	async (query, { rejectWithValue }) => {
		try {
			return await revenueReportService.getByPaymentMethod(query);
		}
		catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to load revenue report by payment method chart';
			return rejectWithValue(msg);
		}
	},
);

const revenueReportSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialRevenueReportState,
	reducers: {
		setReportKioskIds: (state, action: PayloadAction<string[]>) => {
			state.reportKioskIds = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchRevenueOverview.pending, (state) => {
				state.overview.status = 'pending';
				state.overview.error = null;
			})
			.addCase(fetchRevenueOverview.fulfilled, (state, action) => {
				state.overview.status = 'success';
				state.overview.data = action.payload;
				state.overview.error = null;
			})
			.addCase(fetchRevenueOverview.rejected, (state, action) => {
				state.overview.status = 'error';
				state.overview.error = action.payload || 'Failed to load revenue overview';
				state.overview.data = undefined;
			})
			.addCase(fetchRevenueByHour.pending, (state) => {
				state.byHour.status = 'pending';
				state.byHour.error = null;
			})
			.addCase(fetchRevenueByHour.fulfilled, (state, action) => {
				state.byHour.status = 'success';
				state.byHour.overview = action.payload.overview;
				state.byHour.items = action.payload.stats.items;
				state.byHour.error = null;
				state.byHour.total = action.payload.stats.total;
				state.byHour.page = action.payload.stats.page;
				state.byHour.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByHour.rejected, (state, action) => {
				state.byHour.status = 'error';
				state.byHour.error = action.payload || 'Failed to load revenue report by hour';
				state.byHour.items = [];
			})
			.addCase(fetchRevenueByOrderTime.pending, (state) => {
				state.byOrderTime.status = 'pending';
				state.byOrderTime.error = null;
			})
			.addCase(fetchRevenueByOrderTime.fulfilled, (state, action) => {
				state.byOrderTime.status = 'success';
				state.byOrderTime.overview = action.payload.overview;
				state.byOrderTime.items = action.payload.stats.items;
				state.byOrderTime.error = null;
				state.byOrderTime.total = action.payload.stats.total;
				state.byOrderTime.page = action.payload.stats.page;
				state.byOrderTime.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByOrderTime.rejected, (state, action) => {
				state.byOrderTime.status = 'error';
				state.byOrderTime.error = action.payload || 'Failed to load revenue report by order time';
				state.byOrderTime.items = [];
			})
			.addCase(fetchRevenueTimeSeriesChart.pending, (state) => {
				state.timeSeriesChart.status = 'pending';
				state.timeSeriesChart.error = null;
			})
			.addCase(fetchRevenueTimeSeriesChart.fulfilled, (state, action) => {
				state.timeSeriesChart.status = 'success';
				state.timeSeriesChart.overview = action.payload.overview;
				state.timeSeriesChart.items = action.payload.stats.items;
				state.timeSeriesChart.error = null;
				state.timeSeriesChart.total = action.payload.stats.total;
				state.timeSeriesChart.page = action.payload.stats.page;
				state.timeSeriesChart.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueTimeSeriesChart.rejected, (state, action) => {
				state.timeSeriesChart.status = 'error';
				state.timeSeriesChart.error = action.payload || 'Failed to load revenue report by order time';
				state.timeSeriesChart.items = [];
			})
			.addCase(fetchRevenueByKiosk.pending, (state) => {
				state.byKiosk.status = 'pending';
				state.byKiosk.error = null;
			})
			.addCase(fetchRevenueByKiosk.fulfilled, (state, action) => {
				state.byKiosk.status = 'success';
				state.byKiosk.overview = action.payload.overview;
				state.byKiosk.items = action.payload.stats.items;
				state.byKiosk.error = null;
				state.byKiosk.total = action.payload.stats.total;
				state.byKiosk.page = action.payload.stats.page;
				state.byKiosk.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByKiosk.rejected, (state, action) => {
				state.byKiosk.status = 'error';
				state.byKiosk.error = action.payload || 'Failed to load revenue report by kiosk';
				state.byKiosk.items = [];
			})
			.addCase(fetchRevenueByKioskChart.pending, (state) => {
				state.byKioskChart.status = 'pending';
				state.byKioskChart.error = null;
			})
			.addCase(fetchRevenueByKioskChart.fulfilled, (state, action) => {
				state.byKioskChart.status = 'success';
				state.byKioskChart.overview = action.payload.overview;
				state.byKioskChart.items = action.payload.stats.items;
				state.byKioskChart.error = null;
				state.byKioskChart.total = action.payload.stats.total;
				state.byKioskChart.page = action.payload.stats.page;
				state.byKioskChart.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByKioskChart.rejected, (state, action) => {
				state.byKioskChart.status = 'error';
				state.byKioskChart.error = action.payload || 'Failed to load revenue report by kiosk chart';
				state.byKioskChart.items = [];
			})
			.addCase(fetchRevenueByProduct.pending, (state) => {
				state.byProduct.status = 'pending';
				state.byProduct.error = null;
			})
			.addCase(fetchRevenueByProduct.fulfilled, (state, action) => {
				state.byProduct.status = 'success';
				state.byProduct.overview = action.payload.overview;
				state.byProduct.items = action.payload.stats.items;
				state.byProduct.error = null;
				state.byProduct.total = action.payload.stats.total;
				state.byProduct.page = action.payload.stats.page;
				state.byProduct.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByProduct.rejected, (state, action) => {
				state.byProduct.status = 'error';
				state.byProduct.error = action.payload || 'Failed to load revenue report by product';
				state.byProduct.items = [];
			})
			.addCase(fetchRevenueByProductChart.pending, (state) => {
				state.byProductChart.status = 'pending';
				state.byProductChart.error = null;
			})
			.addCase(fetchRevenueByProductChart.fulfilled, (state, action) => {
				state.byProductChart.status = 'success';
				state.byProductChart.overview = action.payload.overview;
				state.byProductChart.items = action.payload.stats.items;
				state.byProductChart.error = null;
				state.byProductChart.total = action.payload.stats.total;
				state.byProductChart.page = action.payload.stats.page;
				state.byProductChart.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByProductChart.rejected, (state, action) => {
				state.byProductChart.status = 'error';
				state.byProductChart.error = action.payload || 'Failed to load revenue report by product chart';
				state.byProductChart.items = [];
			})
			.addCase(fetchRevenueByCategory.pending, (state) => {
				state.byCategory.status = 'pending';
				state.byCategory.error = null;
			})
			.addCase(fetchRevenueByCategory.fulfilled, (state, action) => {
				state.byCategory.status = 'success';
				state.byCategory.overview = action.payload.overview;
				state.byCategory.items = action.payload.stats.items;
				state.byCategory.error = null;
				state.byCategory.total = action.payload.stats.total;
				state.byCategory.page = action.payload.stats.page;
				state.byCategory.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByCategory.rejected, (state, action) => {
				state.byCategory.status = 'error';
				state.byCategory.error = action.payload || 'Failed to load revenue report by category';
				state.byCategory.items = [];
			})
			.addCase(fetchRevenueByCategoryChart.pending, (state) => {
				state.byCategoryChart.status = 'pending';
				state.byCategoryChart.error = null;
			})
			.addCase(fetchRevenueByCategoryChart.fulfilled, (state, action) => {
				state.byCategoryChart.status = 'success';
				state.byCategoryChart.overview = action.payload.overview;
				state.byCategoryChart.items = action.payload.stats.items;
				state.byCategoryChart.error = null;
				state.byCategoryChart.total = action.payload.stats.total;
				state.byCategoryChart.page = action.payload.stats.page;
				state.byCategoryChart.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByCategoryChart.rejected, (state, action) => {
				state.byCategoryChart.status = 'error';
				state.byCategoryChart.error = action.payload || 'Failed to load revenue report by category chart';
				state.byCategoryChart.items = [];
			})
			.addCase(fetchRevenueByPaymentMethod.pending, (state) => {
				state.byPaymentMethod.status = 'pending';
				state.byPaymentMethod.error = null;
			})
			.addCase(fetchRevenueByPaymentMethod.fulfilled, (state, action) => {
				state.byPaymentMethod.status = 'success';
				state.byPaymentMethod.overview = action.payload.overview;
				state.byPaymentMethod.items = action.payload.stats.items;
				state.byPaymentMethod.error = null;
				state.byPaymentMethod.total = action.payload.stats.total;
				state.byPaymentMethod.page = action.payload.stats.page;
				state.byPaymentMethod.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByPaymentMethod.rejected, (state, action) => {
				state.byPaymentMethod.status = 'error';
				state.byPaymentMethod.error = action.payload || 'Failed to load revenue report by payment method';
				state.byPaymentMethod.items = [];
			})
			.addCase(fetchRevenueByPaymentMethodChart.pending, (state) => {
				state.byPaymentMethodChart.status = 'pending';
				state.byPaymentMethodChart.error = null;
			})
			.addCase(fetchRevenueByPaymentMethodChart.fulfilled, (state, action) => {
				state.byPaymentMethodChart.status = 'success';
				state.byPaymentMethodChart.overview = action.payload.overview;
				state.byPaymentMethodChart.items = action.payload.stats.items;
				state.byPaymentMethodChart.error = null;
				state.byPaymentMethodChart.total = action.payload.stats.total;
				state.byPaymentMethodChart.page = action.payload.stats.page;
				state.byPaymentMethodChart.size = action.payload.stats.size;
			})
			.addCase(fetchRevenueByPaymentMethodChart.rejected, (state, action) => {
				state.byPaymentMethodChart.status = 'error';
				state.byPaymentMethodChart.error = action.payload || 'Failed to load revenue report by payment method chart';
				state.byPaymentMethodChart.items = [];
			});
	},
});

export const { reducer, actions: revenueReportUiActions } = revenueReportSlice;
export const { setReportKioskIds } = revenueReportUiActions;
