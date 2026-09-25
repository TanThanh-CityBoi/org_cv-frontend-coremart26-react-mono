import { ActionReducerMapBuilder, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { basePagedReduxState } from '@/types';
import { SortDirection } from '@/types/search-graph';

import { kioskProductService } from './kioskProductService';

import type { KioskProduct } from './type';
import type { PagedReduxState, PagedSearchResponse, SearchOrder, SearchParams } from '@/types';


export const SLICE_NAME = 'vendingMachine.kioskProduct';

export const DEFAULT_PAGE_SIZE = 10;

export type SearchKioskProductsPayload = {
	orgId: string;
} & SearchParams;

export type KioskProductState = {
	list: PagedReduxState<KioskProduct>;
};

export const initialKioskProductState: KioskProductState = {
	list: basePagedReduxState(DEFAULT_PAGE_SIZE),
};

export const searchKioskProducts = createAsyncThunk<
	PagedSearchResponse<KioskProduct>,
	SearchKioskProductsPayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/searchKioskProducts`,
	async (payload, { rejectWithValue }) => {
		const { orgId, ...params } = payload ?? {};
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskProductService.searchKioskProducts(orgId, {
				...(params || {}),
				graph: { order, ...(params?.graph || {}) },
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to search kiosk products';
			return rejectWithValue(message);
		}
	},
);

const kioskProductSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskProductState,
	reducers: {},
	extraReducers: (builder) => {
		searchKioskProductsReducers(builder);
	},
});

function searchKioskProductsReducers(builder: ActionReducerMapBuilder<KioskProductState>) {
	builder
		.addCase(searchKioskProducts.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(searchKioskProducts.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(searchKioskProducts.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload ?? 'Failed to search kiosk products';
			state.list.items = [];
		});
}

export const { reducer } = kioskProductSlice;
