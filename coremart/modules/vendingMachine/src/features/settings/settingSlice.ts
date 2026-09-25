import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { basePagedReduxState } from '@/types';
import { SortDirection } from '@/types/search-graph';

import { SettingCreatePayload } from './hooks/useSettingCreate';
import { SettingUpdatePayload } from './hooks/useSettingEdit';
import { settingService } from './settingService';
import { Setting } from './types';

import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	RestArchiveResponse,
	PagedReduxState,
	PagedSearchResponse,
	SearchParams,
	SearchOrder,
} from '@/types';


export const SLICE_NAME = 'vendingMachine.setting';

export const DEFAULT_PAGE_SIZE = 20;


export type SettingState = {
	detail: ReduxActionState<Setting>;
	list: PagedReduxState<Setting>;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
	archive: ReduxActionState<RestArchiveResponse>;
};

export const initialSettingState: SettingState = {
	detail: baseReduxActionState,
	list: basePagedReduxState(DEFAULT_PAGE_SIZE),
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
};


export const listSettings = createAsyncThunk<
	PagedSearchResponse<Setting>,
	SearchParams<Setting> | undefined,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listSettings`,
	async (params, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await settingService.searchSettings({
				...(params || {}),
				graph: { order, ...((params || {}).graph || {}) },
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list settings';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getSetting = createAsyncThunk<
	Setting,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getSetting`,
	async (id, { rejectWithValue }) => {
		try {
			return await settingService.getSetting(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createSetting = createAsyncThunk<
	RestCreateResponse,
	SettingCreatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createSetting`,
	async (body, { rejectWithValue }) => {
		try {
			return await settingService.createSetting(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateSetting = createAsyncThunk<
	RestUpdateResponse,
	SettingUpdatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateSetting`,
	async ({ id, body }, { rejectWithValue }) => {
		try {
			return await settingService.updateSetting({ id, body });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteSetting = createAsyncThunk<
	RestDeleteResponse,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteSetting`,
	async ({ id }, { rejectWithValue }) => {
		try {
			return await settingService.deleteSetting(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const setArchivedSetting = createAsyncThunk<
	RestArchiveResponse,
	{ id: string; etag: string; isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setArchivedSetting`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await settingService.setArchivedSetting(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to set archived setting';
			return rejectWithValue(errorMessage);
		}
	},
);

const settingSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialSettingState,
	reducers: {
		setSettings: (state, action: PayloadAction<Setting[]>) => {
			state.list.items = action.payload;
		},
		resetCreateSetting: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateSetting: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteSetting: (state) => {
			state.delete = baseReduxActionState;
		},
		resetSetArchivedSetting: (state) => {
			state.archive = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listSettingsReducers(builder);
		getSettingReducers(builder);
		createSettingReducers(builder);
		updateSettingReducers(builder);
		deleteSettingReducers(builder);
		setArchivedSettingReducers(builder);
	},
});

function listSettingsReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(listSettings.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listSettings.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(listSettings.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list settings';
			state.list.items = [];
		});
}

function getSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(getSetting.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getSetting.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getSetting.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get setting';
			state.detail.data = undefined;
		});
}

function createSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(createSetting.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createSetting.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createSetting.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create setting';
			state.create.requestId = action.meta.requestId;
		});
}

function updateSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(updateSetting.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateSetting.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateSetting.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update setting';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(deleteSetting.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteSetting.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.data = action.payload;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteSetting.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete setting';
			state.delete.requestId = action.meta.requestId;
		});
}

function setArchivedSettingReducers(builder: ActionReducerMapBuilder<SettingState>) {
	builder
		.addCase(setArchivedSetting.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedSetting.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedSetting.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to set archived setting';
			state.archive.requestId = action.meta.requestId;
		});
}

export const actions = {
	...settingSlice.actions,
};

export const { reducer } = settingSlice;
