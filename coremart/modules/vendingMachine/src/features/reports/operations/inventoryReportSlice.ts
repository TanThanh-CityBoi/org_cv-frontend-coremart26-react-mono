import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { basePagedReduxState, type PagedReduxState, type PagedSearchResponse } from '@/types';

import {
	inventoryReportService,
	INVENTORY_REPORT_DEFAULT_PAGE_SIZE,
	type InventoryReportQuery,
} from './inventoryReportService';

import type { ProductInventoryReport } from './components/InventoryReport/type';


export const SLICE_NAME = 'vendingMachine.inventoryReport';

export type InventoryReportState = {
	/** Server-paged list for the detail table. */
	products: PagedReduxState<ProductInventoryReport>;
	/** Top-N batch used by the stock bar chart (no UI pagination). */
	chartProducts: PagedReduxState<ProductInventoryReport>;
};

export const initialInventoryReportState: InventoryReportState = {
	products: { ...basePagedReduxState<ProductInventoryReport>(INVENTORY_REPORT_DEFAULT_PAGE_SIZE) },
	chartProducts: { ...basePagedReduxState<ProductInventoryReport>(50) },
};

export const fetchInventoryProducts = createAsyncThunk<
	PagedSearchResponse<ProductInventoryReport>,
	InventoryReportQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchInventoryProducts`,
	async (query, { rejectWithValue }) => {
		try {
			return await inventoryReportService.getProducts(query);
		}
		catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : 'Failed to load inventory products');
		}
	},
);

export const fetchInventoryChartProducts = createAsyncThunk<
	PagedSearchResponse<ProductInventoryReport>,
	InventoryReportQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchInventoryChartProducts`,
	async (query, { rejectWithValue }) => {
		try {
			return await inventoryReportService.getProducts(query);
		}
		catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : 'Failed to load inventory chart products');
		}
	},
);

function applyPaged(
	state: PagedReduxState<ProductInventoryReport>,
	payload: PagedSearchResponse<ProductInventoryReport>,
): void {
	state.status = 'success';
	state.items = payload.items;
	state.total = payload.total;
	state.page = payload.page;
	state.size = payload.size;
	state.error = null;
}

const inventoryReportSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialInventoryReportState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchInventoryProducts.pending, (state) => {
				state.products.status = 'pending';
				state.products.error = null;
			})
			.addCase(fetchInventoryProducts.fulfilled, (state, action) => {
				applyPaged(state.products, action.payload);
			})
			.addCase(fetchInventoryProducts.rejected, (state, action) => {
				state.products.status = 'error';
				state.products.error = action.payload ?? 'Failed to load inventory products';
				state.products.items = [];
			})
			.addCase(fetchInventoryChartProducts.pending, (state) => {
				state.chartProducts.status = 'pending';
				state.chartProducts.error = null;
			})
			.addCase(fetchInventoryChartProducts.fulfilled, (state, action) => {
				applyPaged(state.chartProducts, action.payload);
			})
			.addCase(fetchInventoryChartProducts.rejected, (state, action) => {
				state.chartProducts.status = 'error';
				state.chartProducts.error = action.payload ?? 'Failed to load inventory chart products';
				state.chartProducts.items = [];
			});
	},
});

export const { reducer } = inventoryReportSlice;
