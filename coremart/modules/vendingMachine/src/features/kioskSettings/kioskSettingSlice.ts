import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { kioskService } from '@/features/kiosks/kioskService';
import { basePagedReduxState, SearchOrder } from '@/types';
import { SortDirection } from '@/types/search-graph';

import { kioskSettingService } from './kioskSettingService';

import type { KioskSettingCreatePayload, KioskSettingUpdatePayload } from './hooks/kioskSettingPayloads';
import type { KioskSetting } from './types';
import type { Kiosk } from '@/features/kiosks/types';
import type {
	PagedReduxState,
	PagedSearchResponse,
	RestArchiveResponse,
	RestCreateResponse,
	RestDeleteResponse,
	RestUpdateResponse,
	SearchParams,
} from '@/types';


export const SLICE_NAME = 'vendingMachine.kioskSetting';

export const KIOSK_SETTING_DEFAULT_PAGE_SIZE = 10;

/** Kiosk search fields for setting-detail kiosk tab (same as global kiosk list API). */
const KIOSK_LIST_IN_SETTING_FIELDS: Array<keyof Kiosk> = [
	'id',
	'etag',
	'code',
	'name',
	'isArchived',
	'mode',
	'uiMode',
	'locationAddress',
	'latitude',
	'longitude',
	'createdAt',
	'updatedAt',
];

/** Columns for list search (table rows). */
export const KIOSK_SETTING_LIST_FIELDS: Array<keyof KioskSetting> = [
	'id',
	'etag',
	'code',
	'name',
	'description',
	'isArchived',
	'createdAt',
	'updatedAt',
];

/** Columns for detail / preview fetch. */
export const KIOSK_SETTING_DETAIL_FIELDS: Array<keyof KioskSetting> = [
	'id',
	'etag',
	'code',
	'name',
	'description',
	'isArchived',
	'config',
	'shoppingScreenPlaylistRef',
	'waitingScreenPlaylistRef',
	'themeRef',
	'gameRef',
	'scopeType',
	'shoppingScreenPlaylistSetting',
	'waitingScreenPlaylistSetting',
	'themeSetting',
	'gameSetting',
	'createdAt',
	'updatedAt',
];

export type GetKioskSettingRequest = { id: string; fields?: Array<keyof KioskSetting> };

export type KioskSettingState = {
	detail: ReduxActionState<KioskSetting | undefined>;
	list: PagedReduxState<KioskSetting>;
	/** Kiosk list loaded only for kiosk-setting UI (avoids clobbering `kiosk.list`). */
	kioskListInSetting: PagedReduxState<Kiosk>;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
	archive: ReduxActionState<RestArchiveResponse>;
	manageKioskSettingKiosks: ReduxActionState<RestUpdateResponse>;
};

export const initialKioskSettingState: KioskSettingState = {
	detail: baseReduxActionState,
	list: basePagedReduxState(KIOSK_SETTING_DEFAULT_PAGE_SIZE),
	kioskListInSetting: basePagedReduxState(KIOSK_SETTING_DEFAULT_PAGE_SIZE),
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
	manageKioskSettingKiosks: baseReduxActionState,
};


export const listKiosksInSetting = createAsyncThunk<
	PagedSearchResponse<Kiosk>,
	SearchParams<Kiosk> | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKiosksInSetting`,
	async (params = {}, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskService.searchKiosks({
				fields: KIOSK_LIST_IN_SETTING_FIELDS,
				...params,
				graph: { order, ...(params?.graph || {}) },
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosks';
			return rejectWithValue(errorMessage);
		}
	},
);

export const searchKioskSettings = createAsyncThunk<
	PagedSearchResponse<KioskSetting>,
	SearchParams<KioskSetting> | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/searchKioskSettings`,
	async (params = {}, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskSettingService.searchKioskSettings({
				fields: KIOSK_SETTING_LIST_FIELDS,
				...(params || {}),
				page: params?.page ?? 0,
				size: params?.size ?? KIOSK_SETTING_DEFAULT_PAGE_SIZE,
				extra: { ...params?.extra },
				graph: { order, ...(params?.graph || {}) },
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to search kiosk settings';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKioskSetting = createAsyncThunk<
	KioskSetting | undefined,
	GetKioskSettingRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKioskSetting`,
	async ({ id, fields }, { rejectWithValue }) => {
		try {
			return await kioskSettingService.getKioskSetting(id, fields ?? KIOSK_SETTING_DETAIL_FIELDS);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKioskSetting = createAsyncThunk<
	RestCreateResponse,
	KioskSettingCreatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKioskSetting`,
	async (body, { rejectWithValue }) => {
		try {
			return await kioskSettingService.createKioskSetting(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKioskSetting = createAsyncThunk<
	RestUpdateResponse,
	KioskSettingUpdatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskSetting`,
	async (payload, { rejectWithValue }) => {
		try {
			return await kioskSettingService.updateKioskSetting(payload);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskSetting = createAsyncThunk<
	RestDeleteResponse,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKioskSetting`,
	async ({ id }, { rejectWithValue }) => {
		try {
			return await kioskSettingService.deleteKioskSetting(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export const setArchivedKioskSetting = createAsyncThunk<
	RestArchiveResponse,
	{ id: string; etag: string; isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setArchivedKioskSetting`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await kioskSettingService.setArchivedKioskSetting(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to archive kiosk setting';
			return rejectWithValue(errorMessage);
		}
	},
);

export type ManageKioskSettingKiosksRequest = {
	settingId: string;
	add: string[];
	remove: string[];
};

export const manageKioskSettingKiosks = createAsyncThunk<
	RestUpdateResponse,
	ManageKioskSettingKiosksRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/manageKioskSettingKiosks`,
	async ({ settingId, add, remove }, { rejectWithValue }) => {
		try {
			return await kioskSettingService.manageKioskSettingKiosks(settingId, { add, remove });
		}
		catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: 'Failed to manage kiosk setting kiosks';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskSettingSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskSettingState,
	reducers: {
		setKioskSettings: (state, action: PayloadAction<KioskSetting[]>) => {
			state.list.items = action.payload;
		},
		resetCreateKioskSetting: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKioskSetting: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKioskSetting: (state) => {
			state.delete = baseReduxActionState;
		},
		resetArchiveKioskSetting: (state) => {
			state.archive = baseReduxActionState;
		},
		resetManageKioskSettingKiosks: (state) => {
			state.manageKioskSettingKiosks = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKiosksInSettingReducers(builder);
		searchKioskSettingsReducers(builder);
		getKioskSettingReducers(builder);
		createKioskSettingReducers(builder);
		updateKioskSettingReducers(builder);
		deleteKioskSettingReducers(builder);
		setArchivedKioskSettingReducers(builder);
		manageKioskSettingKiosksReducers(builder);
	},
});

function listKiosksInSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(listKiosksInSetting.pending, (state) => {
			state.kioskListInSetting.status = 'pending';
			state.kioskListInSetting.error = null;
		})
		.addCase(listKiosksInSetting.fulfilled, (state, action) => {
			state.kioskListInSetting.status = 'success';
			state.kioskListInSetting.items = action.payload.items;
			state.kioskListInSetting.error = null;
			state.kioskListInSetting.total = action.payload.total;
			state.kioskListInSetting.page = action.payload.page;
			state.kioskListInSetting.size = action.payload.size;
		})
		.addCase(listKiosksInSetting.rejected, (state, action) => {
			state.kioskListInSetting.status = 'error';
			state.kioskListInSetting.error = action.payload || 'Failed to list kiosks';
			state.kioskListInSetting.items = [];
		});
}

function searchKioskSettingsReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(searchKioskSettings.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(searchKioskSettings.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(searchKioskSettings.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to search kiosk settings';
			state.list.items = [];
		});
}

function getKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(getKioskSetting.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg.id;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getKioskSetting.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
		})
		.addCase(getKioskSetting.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk setting';
			state.detail.data = undefined;
		});
}

function createKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(createKioskSetting.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKioskSetting.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKioskSetting.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk setting';
			state.create.requestId = action.meta.requestId;
		});
}

function updateKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(updateKioskSetting.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKioskSetting.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKioskSetting.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk setting';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(deleteKioskSetting.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKioskSetting.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.data = action.payload;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKioskSetting.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk setting';
			state.delete.requestId = action.meta.requestId;
		});
}

function setArchivedKioskSettingReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(setArchivedKioskSetting.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKioskSetting.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKioskSetting.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to archive kiosk setting';
			state.archive.requestId = action.meta.requestId;
		});
}

function manageKioskSettingKiosksReducers(builder: ActionReducerMapBuilder<KioskSettingState>) {
	builder
		.addCase(manageKioskSettingKiosks.pending, (state, action) => {
			state.manageKioskSettingKiosks.status = 'pending';
			state.manageKioskSettingKiosks.error = null;
			state.manageKioskSettingKiosks.requestId = action.meta.requestId;
		})
		.addCase(manageKioskSettingKiosks.fulfilled, (state, action) => {
			state.manageKioskSettingKiosks.status = 'success';
			state.manageKioskSettingKiosks.data = action.payload;
			state.manageKioskSettingKiosks.error = null;
			state.manageKioskSettingKiosks.requestId = action.meta.requestId;
		})
		.addCase(manageKioskSettingKiosks.rejected, (state, action) => {
			state.manageKioskSettingKiosks.status = 'error';
			state.manageKioskSettingKiosks.error =
				action.payload || 'Failed to manage kiosk setting kiosks';
			state.manageKioskSettingKiosks.requestId = action.meta.requestId;
		});
}

export const actions = { ...kioskSettingSlice.actions };
export const { reducer } = kioskSettingSlice;
