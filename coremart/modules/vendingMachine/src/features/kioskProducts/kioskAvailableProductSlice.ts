import { ActionReducerMapBuilder, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { basePagedReduxState } from '@/types';
import { SortDirection } from '@/types/search-graph';

import { kioskAvailableProductService } from './kioskAvailableProductService';

import type { KioskProduct } from './type';
import type { PagedReduxState, PagedSearchResponse, SearchOrder, SearchParams } from '@/types';


export const SLICE_NAME = 'vendingMachine.kioskAvailableProduct';

export const DEFAULT_AVAILABLE_PAGE_SIZE = 5;

export type SearchKioskAvailableProductsPayload = {
	kioskId: string;
} & SearchParams;

export type KioskAvailableProductState = {
	list: PagedReduxState<KioskProduct>;
};

export const initialKioskAvailableProductState: KioskAvailableProductState = {
	list: basePagedReduxState(DEFAULT_AVAILABLE_PAGE_SIZE),
};

export const searchKioskAvailableProducts = createAsyncThunk<
	PagedSearchResponse<KioskProduct>,
	SearchKioskAvailableProductsPayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/searchKioskAvailableProducts`,
	async (payload, { rejectWithValue }) => {
		const { kioskId, ...params } = payload ?? {};
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskAvailableProductService.searchKioskAvailableProducts(kioskId, {
				...(params || {}),
				graph: { order, ...(params?.graph || {}) },
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load kiosk available products';
			return rejectWithValue(message);
		}
	},
);

const kioskAvailableProductSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskAvailableProductState,
	reducers: {},
	extraReducers: (builder) => {
		searchKioskAvailableProductsReducers(builder);
	},
});

function searchKioskAvailableProductsReducers(
	builder: ActionReducerMapBuilder<KioskAvailableProductState>,
) {
	builder
		.addCase(searchKioskAvailableProducts.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(searchKioskAvailableProducts.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(searchKioskAvailableProducts.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload ?? 'Failed to load kiosk available products';
			state.list.items = [];
		});
}

export const { reducer } = kioskAvailableProductSlice;
