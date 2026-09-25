import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice,
} from '@reduxjs/toolkit';

import { basePagedReduxState } from '@/types';
import { SortDirection } from '@/types/search-graph';

import { kioskMediaService } from './kioskMediaService';

import type { KioskMedia } from './types';
import type { PagedReduxState, PagedSearchResponse, SearchOrder, SearchParams } from '@/types';


export const SLICE_NAME = 'vendingMachine.kioskMedia';

export const KIOSK_MEDIA_DEFAULT_PAGE_SIZE = 10;

export type KioskMediaState = {
	list: PagedReduxState<KioskMedia>;
};

export const initialKioskMediaState: KioskMediaState = {
	list: basePagedReduxState(KIOSK_MEDIA_DEFAULT_PAGE_SIZE),
};

export const listKioskMedias = createAsyncThunk<
	PagedSearchResponse<KioskMedia>,
	SearchParams<KioskMedia> | undefined,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKioskMedias`,
	async (params, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskMediaService.searchKioskMedias({
				...(params || {}),
				graph: { order, ...((params || {}).graph || {}) },
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosk media';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskMediaSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskMediaState,
	reducers: {
		resetKioskMediaList: (state) => {
			state.list = basePagedReduxState(KIOSK_MEDIA_DEFAULT_PAGE_SIZE);
		},
	},
	extraReducers: (builder) => {
		listKioskMediasReducers(builder);
	},
});

function listKioskMediasReducers(builder: ActionReducerMapBuilder<KioskMediaState>) {
	builder
		.addCase(listKioskMedias.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKioskMedias.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(listKioskMedias.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosk media';
			state.list.items = [];
		});
}

export const actions = {
	...kioskMediaSlice.actions,
};

export const { reducer } = kioskMediaSlice;
