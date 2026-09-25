import { ActionReducerMapBuilder, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { basePagedReduxState } from '@/types';
import { SortDirection } from '@/types/search-graph';

import { eventAvailableProductService } from './eventAvailableProductService';

import type { KioskProduct } from '@/features/kioskProducts/type';
import type { PagedReduxState, PagedSearchResponse, SearchOrder, SearchParams } from '@/types';



export const SLICE_NAME = 'vendingMachine.eventAvailableProduct';

export const DEFAULT_EVENT_AVAILABLE_PAGE_SIZE = 5;

export type SearchEventAvailableProductsPayload = {
	eventId: string;
} & SearchParams;

export type EventAvailableProductState = {
	list: PagedReduxState<KioskProduct>;
};

export const initialEventAvailableProductState: EventAvailableProductState = {
	list: basePagedReduxState(DEFAULT_EVENT_AVAILABLE_PAGE_SIZE),
};

export const searchEventAvailableProducts = createAsyncThunk<
	PagedSearchResponse<KioskProduct>,
	SearchEventAvailableProductsPayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/searchEventAvailableProducts`,
	async (payload, { rejectWithValue }) => {
		const { eventId, ...params } = payload ?? {};
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await eventAvailableProductService.searchEventAvailableProducts(eventId, {
				...(params || {}),
				graph: { order, ...(params?.graph || {}) },
			});
		}
		catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load event available products';
			return rejectWithValue(message);
		}
	},
);

const eventAvailableProductSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialEventAvailableProductState,
	reducers: {},
	extraReducers: (builder) => {
		searchEventAvailableProductsReducers(builder);
	},
});

function searchEventAvailableProductsReducers(builder: ActionReducerMapBuilder<EventAvailableProductState>) {
	builder
		.addCase(searchEventAvailableProducts.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(searchEventAvailableProducts.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(searchEventAvailableProducts.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload ?? 'Failed to load event available products';
			state.list.items = [];
		});
}

export const { reducer } = eventAvailableProductSlice;
