
import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { refundReportService, REFUND_REPORT_DEFAULT_PAGE_SIZE } from './refundReportService';
import { RefundReport } from './type';

import type {
	KioskRefundReport,
	OrderRefundReport,
	PaymentMethodRefundReport,
	ProductRefundReport,
	RefundOverview,
} from './components/RefundReport/type';
import type {
	RefundReportByKioskQuery,
	RefundReportByPaymentMethodQuery,
	RefundReportByProductQuery,
	RefundReportOrdersQuery,
	RefundReportOverviewQuery,
} from '@/types';


export const SLICE_NAME = 'vendingMachine.refundReport';

/**
 * Merged paged state for revenue report slices that have both a list of items and an overview.
 * Extends the `PagedReduxState` concept with an `overview` field.
 */
export type PagedRefundReportState<R> = {
	status: 'idle' | 'pending' | 'success' | 'error';
	error: string | null;
	overview: any;
	items: R[] | null;
	total: number;
	page: number;
	size: number;
};

const emptyRefundReportState = <R>(): PagedRefundReportState<R> => ({
	status: 'idle',
	error: null,
	overview: null,
	items: [],
	total: 0,
	page: 0,
	size: REFUND_REPORT_DEFAULT_PAGE_SIZE,
});


export type RefundReportState = {
	overview: ReduxActionState<RefundOverview>;
	byKiosk: PagedRefundReportState<KioskRefundReport>;
	byPaymentMethod: PagedRefundReportState<PaymentMethodRefundReport>;
	byProduct: PagedRefundReportState<ProductRefundReport>;
	orders: PagedRefundReportState<OrderRefundReport>;
};

export const initialRefundReportState: RefundReportState = {
	overview: { ...baseReduxActionState },
	byKiosk: emptyRefundReportState(),
	byPaymentMethod: emptyRefundReportState(),
	byProduct: emptyRefundReportState(),
	orders: emptyRefundReportState(),
};


export const fetchRefundOverview = createAsyncThunk<
	RefundOverview,
	RefundReportOverviewQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRefundOverview`,
	async (query, { rejectWithValue }) => {
		try {
			return await refundReportService.getOverview(query);
		}
		catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : 'Failed to load refund overview');
		}
	},
);

export const fetchRefundByKiosk = createAsyncThunk<
	RefundReport<KioskRefundReport>,
	RefundReportByKioskQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRefundByKiosk`,
	async (query, { rejectWithValue }) => {
		try {
			return await refundReportService.getByKiosk(query);
		}
		catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : 'Failed to load refund by kiosk');
		}
	},
);

export const fetchRefundByPaymentMethod = createAsyncThunk<
	RefundReport<PaymentMethodRefundReport>,
	RefundReportByPaymentMethodQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRefundByPaymentMethod`,
	async (query, { rejectWithValue }) => {
		try {
			return await refundReportService.getByPaymentMethod(query);
		}
		catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : 'Failed to load refund by payment method');
		}
	},
);

export const fetchRefundByProduct = createAsyncThunk<
	RefundReport<ProductRefundReport>,
	RefundReportByProductQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRefundByProduct`,
	async (query, { rejectWithValue }) => {
		try {
			return await refundReportService.getByProduct(query);
		}
		catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : 'Failed to load refund by product');
		}
	},
);

export const fetchRefundOrders = createAsyncThunk<
	RefundReport<OrderRefundReport>,
	RefundReportOrdersQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchRefundOrders`,
	async (query, { rejectWithValue }) => {
		try {
			return await refundReportService.getOrders(query);
		}
		catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : 'Failed to load refund orders');
		}
	},
);

function refundReportPending<R>(s: PagedRefundReportState<R>): void {
	s.status = 'pending';
	s.error = null;
}

function refundReportFulfilled<R>(s: PagedRefundReportState<R>, payload: RefundReport<R> ): void {
	s.status = 'success';
	s.overview = payload.overview;
	s.total = payload.stats.total;
	s.page = payload.stats.page;
	s.size = payload.stats.size;
	s.items = payload.stats.items ?? [];
	s.error = null;
}

function refundReportRejected<R>(s: PagedRefundReportState<R>, error: string): void {
	s.status = 'error';
	s.error = error;
	s.overview = null;
	s.items = [];
	s.total = 0;
}

const refundReportSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialRefundReportState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchRefundOverview.pending, (state) => {
				state.overview.status = 'pending';
				state.overview.error = null;
			})
			.addCase(fetchRefundOverview.fulfilled, (state, action) => {
				state.overview.status = 'success';
				state.overview.data = action.payload;
				state.overview.error = null;
			})
			.addCase(fetchRefundOverview.rejected, (state, action) => {
				state.overview.status = 'error';
				state.overview.error = action.payload ?? 'Failed to load refund overview';
				state.overview.data = undefined;
			})
			.addCase(fetchRefundByKiosk.pending, (state) => { refundReportPending(state.byKiosk); })
			.addCase(fetchRefundByKiosk.fulfilled, (state, action) => {
				refundReportFulfilled(state.byKiosk, action.payload);
			})
			.addCase(fetchRefundByKiosk.rejected, (state, action) => { refundReportRejected(state.byKiosk, action.payload ?? 'Failed'); })
			.addCase(fetchRefundByPaymentMethod.pending, (state) => { refundReportPending(state.byPaymentMethod); })
			.addCase(fetchRefundByPaymentMethod.fulfilled, (state, action) => {
				refundReportFulfilled(state.byPaymentMethod, action.payload);
			})
			.addCase(fetchRefundByPaymentMethod.rejected, (state, action) => { refundReportRejected(state.byPaymentMethod, action.payload ?? 'Failed'); })
			.addCase(fetchRefundByProduct.pending, (state) => { refundReportPending(state.byProduct); })
			.addCase(fetchRefundByProduct.fulfilled, (state, action) => {
				refundReportFulfilled(state.byProduct, action.payload);
			})
			.addCase(fetchRefundByProduct.rejected, (state, action) => {
				refundReportRejected(state.byProduct, action.payload ?? 'Failed');
			})
			.addCase(fetchRefundOrders.pending, (state) => {
				refundReportPending(state.orders);
			})
			.addCase(fetchRefundOrders.fulfilled, (state, action) => {
				refundReportFulfilled(state.orders, action.payload);
			})
			.addCase(fetchRefundOrders.rejected, (state, action) => {
				refundReportRejected(state.orders, action.payload ?? 'Failed to load refund orders');
			});
	},
});

export const { reducer } = refundReportSlice;
