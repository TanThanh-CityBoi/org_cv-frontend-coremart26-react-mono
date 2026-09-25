import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';


import { KioskCreatePayload, KioskUpdatePayload } from './hooks';
import { kioskService, type KioskPositionUpdateItem, type CreateKioskStockBody, type UpdateKioskStockBody } from './kioskService';
import { Kiosk, KioskLog } from './types';

import type { KioskStock } from './components/KioskDetail/KioskStockGrid/kioskStock.types';
import type {
	RestCreateResponse,
	RestUpdateResponse,
	RestDeleteResponse,
	RestArchiveResponse,
	PagedSearchResponse,
	SearchParams,
	PagedReduxState,
	SearchOrder,
} from '@/types';

import { basePagedReduxState } from '@/types';
import { SortDirection } from '@/types/search-graph';


export const SLICE_NAME = 'vendingMachine.kiosk';

export const KIOSK_DEFAULT_PAGE_SIZE = 10;


export const KIOSK_DEFAULT_FIELDS: Array<keyof Kiosk> = [
	'id',
	'etag',
	'code',
	'name',
	'displayName',
	'isArchived',
	'mode',
	'uiMode',
	'locationAddress',
	'latitude',
	'longitude',
	'connection',
	'shelvesNumber',
	'shelvesConfig',
	'createdAt',
	'updatedAt',
];

export const KIOSK_DETAIL_FIELDS: Array<keyof Kiosk> = [
	...KIOSK_DEFAULT_FIELDS,
	'modelRef',
	'model',
	'settingRef',
	'setting',
	'payments',
	'themeRef',
	'theme',
	'gameRef',
	'game',
	'shoppingScreenPlaylistRef',
	'shoppingScreenPlaylist',
	'waitingScreenPlaylistRef',
	'waitingScreenPlaylist',
	'goodsCollectorType',
];

export type KioskStockQuery = { kioskId: string; page?: number; size?: number };

export type KioskState = {
	detail: ReduxActionState<Kiosk>;
	list: PagedReduxState<Kiosk>;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
	archive: ReduxActionState<RestArchiveResponse>;
	/** Kiosk activity logs. */
	kioskLogs: PagedReduxState<KioskLog>;
	/** Kiosk shelf stock lines from GET …/kiosk-stocks search. */
	kioskStock: PagedReduxState<KioskStock>;
	kioskStockQuery: KioskStockQuery | null;
	/** [PUT] …/kiosks/:id/positions */
	kioskPositionsUpdate: ReduxActionState<unknown>;
	/** POST …/kiosks/:kioskId/kiosk-stocks */
	createKioskStock: ReduxActionState<RestCreateResponse>;
	/** POST …/kiosks/:kioskId/kiosk-stocks/bulk */
	bulkCreateKioskStocks: ReduxActionState<RestCreateResponse[]>;
	/** PUT …/kiosks/:kioskId/kiosk-stocks/:id */
	kioskStockUpdate: ReduxActionState<RestUpdateResponse>;
	/** DELETE …/kiosks/:kioskId/kiosk-stocks/:id */
	kioskStockDelete: ReduxActionState<RestDeleteResponse>;
};

export const initialKioskState: KioskState = {
	detail: baseReduxActionState,
	list: basePagedReduxState(KIOSK_DEFAULT_PAGE_SIZE),
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
	kioskLogs: basePagedReduxState(KIOSK_DEFAULT_PAGE_SIZE),
	kioskStock: basePagedReduxState(100),
	kioskStockQuery: null,
	kioskPositionsUpdate: baseReduxActionState,
	createKioskStock: baseReduxActionState,
	bulkCreateKioskStocks: baseReduxActionState,
	kioskStockUpdate: baseReduxActionState,
	kioskStockDelete: baseReduxActionState,
};


export const listKiosks = createAsyncThunk<
	PagedSearchResponse<Kiosk>,
	SearchParams<Kiosk> | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKiosks`,
	async (params = {}, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskService.searchKiosks({
				fields: KIOSK_DEFAULT_FIELDS,
				...params,
				graph: { order, ...(params?.graph || {}) },
				extra: { include_state: 'true' },
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosks';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getKiosk = createAsyncThunk<
	Kiosk,
	string,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/getKiosk`,
	async (id, { rejectWithValue }) => {
		try {
			return await kioskService.getKiosk(id, KIOSK_DETAIL_FIELDS);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createKiosk = createAsyncThunk<
	RestCreateResponse,
	KioskCreatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKiosk`,
	async (body, { rejectWithValue }) => {
		try {
			return await kioskService.createKiosk(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateKiosk = createAsyncThunk<
	RestUpdateResponse,
	KioskUpdatePayload,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKiosk`,
	async ({ id, body }, { rejectWithValue }) => {
		try {
			return await kioskService.updateKiosk({ id, body });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKiosk = createAsyncThunk<
	RestDeleteResponse,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKiosk`,
	async ({ id }, { rejectWithValue }) => {
		try {
			return await kioskService.deleteKiosk(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const setArchivedKiosk = createAsyncThunk<
	RestArchiveResponse,
	{ id: string; etag: string; isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setArchivedKiosk`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await kioskService.setArchivedKiosk(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to set archived kiosk';
			return rejectWithValue(errorMessage);
		}
	},
);

export const fetchKioskStocks = createAsyncThunk<
	PagedSearchResponse<KioskStock>,
	KioskStockQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchKioskStocks`,
	async ({ kioskId, page, size }, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			const result = await kioskService.searchKioskStocks(kioskId, {
				fields: ['id', 'etag', 'sortIndex', 'sellPrice', 'warningQuantity', 'kioskRef', 'productRef', 'positions'],
				page: page ?? 0,
				size: size ?? 100,
				extra: { include_product: 'true' },
				graph: { order },
			});
			return result;
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load kiosk stock';
			return rejectWithValue(errorMessage);
		}
	},
);

export type CreateKioskStockRequest = { kioskId: string } & CreateKioskStockBody;

export type BulkCreateKioskStocksRequest = { kioskId: string; items: CreateKioskStockBody[] };

export const createKioskStock = createAsyncThunk<
	RestCreateResponse,
	CreateKioskStockRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createKioskStock`,
	async ({kioskId, ...body}: CreateKioskStockRequest, { rejectWithValue }) => {
		try {
			return await kioskService.createKioskStock(kioskId, body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk stock';
			return rejectWithValue(errorMessage);
		}
	},
);

export const bulkCreateKioskStocks = createAsyncThunk<
	RestCreateResponse[],
	BulkCreateKioskStocksRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/bulkCreateKioskStocks`,
	async ({ kioskId, items }, { rejectWithValue }) => {
		try {
			return await kioskService.bulkCreateKioskStocks(kioskId, items);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create kiosk stocks (bulk)';
			return rejectWithValue(errorMessage);
		}
	},
);

export type UpdateKioskStockRequest = { kioskId: string; stockId: string } & UpdateKioskStockBody;

export const updateKioskStock = createAsyncThunk<
	RestUpdateResponse,
	UpdateKioskStockRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskStock`,
	async ({ kioskId, stockId, ...body }, { rejectWithValue }) => {
		try {
			return await kioskService.updateKioskStock(kioskId, stockId, body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk stock';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteKioskStock = createAsyncThunk<
	RestDeleteResponse,
	{ kioskId: string; stockId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteKioskStock`,
	async ({ kioskId, stockId }, { rejectWithValue }) => {
		try {
			return await kioskService.deleteKioskStock(kioskId, stockId);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete kiosk stock';
			return rejectWithValue(errorMessage);
		}
	},
);

export type UpdateKioskPositionsArg = { kioskId: string; positions: KioskPositionUpdateItem[] };

export const updateKioskPositions = createAsyncThunk<
	unknown,
	UpdateKioskPositionsArg,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateKioskPositions`,
	async ({ kioskId, positions }, { rejectWithValue }) => {
		try {
			return await kioskService.updateKioskPositions(kioskId, positions);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update kiosk positions';
			return rejectWithValue(errorMessage);
		}
	},
);

const kioskSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialKioskState,
	reducers: {
		setKiosks: (state, action: PayloadAction<Kiosk[]>) => {
			state.list.items = action.payload;
		},
		resetCreateKiosk: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateKiosk: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteKiosk: (state) => {
			state.delete = baseReduxActionState;
		},
		resetSetArchivedKiosk: (state) => {
			state.archive = baseReduxActionState;
		},
		resetKioskPositionsUpdate: (state) => {
			state.kioskPositionsUpdate = baseReduxActionState;
		},
		resetCreateKioskStock: (state) => {
			state.createKioskStock = baseReduxActionState;
		},
		resetBulkCreateKioskStocks: (state) => {
			state.bulkCreateKioskStocks = baseReduxActionState;
		},
		resetKioskStockUpdate: (state) => {
			state.kioskStockUpdate = baseReduxActionState;
		},
		resetKioskStockDelete: (state) => {
			state.kioskStockDelete = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listKiosksReducers(builder);
		getKioskReducers(builder);
		createKioskReducers(builder);
		updateKioskReducers(builder);
		deleteKioskReducers(builder);
		setArchivedKioskReducers(builder);
		searchKioskLogsReducers(builder);
		fetchKioskStocksReducers(builder);
		createKioskStockReducers(builder);
		bulkCreateKioskStocksReducers(builder);
		kioskStockUpdateReducers(builder);
		kioskStockDeleteReducers(builder);
		updateKioskPositionsReducers(builder);
	},
});

function listKiosksReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(listKiosks.pending, (state) => {
			state.list.status = 'pending';
			state.list.error = null;
		})
		.addCase(listKiosks.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
		})
		.addCase(listKiosks.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list kiosks';
			state.list.items = [];
		});
}

function getKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(getKiosk.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
		})
		.addCase(getKiosk.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
		})
		.addCase(getKiosk.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get kiosk';
			state.detail.data = undefined;
		});
}

function createKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(createKiosk.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKiosk.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createKiosk.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create kiosk';
			state.create.requestId = action.meta.requestId;
		});
}

function updateKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(updateKiosk.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKiosk.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateKiosk.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update kiosk';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(deleteKiosk.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKiosk.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.data = action.payload;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteKiosk.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete kiosk';
			state.delete.requestId = action.meta.requestId;
		});
}

function setArchivedKioskReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(setArchivedKiosk.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKiosk.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedKiosk.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to set archived kiosk';
			state.archive.requestId = action.meta.requestId;
		});
}

export const searchKioskLogs = createAsyncThunk<
	PagedSearchResponse<KioskLog>,
	SearchParams<KioskLog> | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/searchKioskLogs`,
	async (params = {}, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskService.searchKioskLogs({
				...params,
				graph: {order, ...(params?.graph || {})},
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to search kiosk logs';
			return rejectWithValue(errorMessage);
		}
	},
);

function searchKioskLogsReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(searchKioskLogs.pending, (state) => {
			state.kioskLogs.status = 'pending';
			state.kioskLogs.error = null;
		})
		.addCase(searchKioskLogs.fulfilled, (state, action) => {
			state.kioskLogs.status = 'success';
			state.kioskLogs.items = action.payload.items;
			state.kioskLogs.error = null;
			state.kioskLogs.total = action.payload.total;
			state.kioskLogs.page = action.payload.page;
			state.kioskLogs.size = action.payload.size;
		})
		.addCase(searchKioskLogs.rejected, (state, action) => {
			state.kioskLogs.status = 'error';
			state.kioskLogs.error = action.payload || 'Failed to search kiosk logs';
			state.kioskLogs.items = [];
		});
}

function fetchKioskStocksReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(fetchKioskStocks.pending, (state, action) => {
			state.kioskStock.status = 'pending';
			state.kioskStock.error = null;
			const { kioskId } = action.meta.arg;
			if (state.kioskStockQuery?.kioskId !== kioskId) {
				state.kioskStock.items = [];
			}
			state.kioskStockQuery = action.meta.arg;
		})
		.addCase(fetchKioskStocks.fulfilled, (state, action) => {
			state.kioskStock.status = 'success';
			state.kioskStock.items = action.payload.items;
			state.kioskStock.error = null;
			state.kioskStock.total = action.payload.total;
			state.kioskStock.page = action.payload.page;
			state.kioskStock.size = action.payload.size;
		})
		.addCase(fetchKioskStocks.rejected, (state, action) => {
			state.kioskStock.status = 'error';
			state.kioskStock.error = action.payload || 'Failed to load kiosk stock';
			state.kioskStock.items = [];
			state.kioskStock.total = 0;
			state.kioskStock.page = 0;
		});
}

function bulkCreateKioskStocksReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(bulkCreateKioskStocks.pending, (state, action) => {
			state.bulkCreateKioskStocks.status = 'pending';
			state.bulkCreateKioskStocks.error = null;
			state.bulkCreateKioskStocks.requestId = action.meta.requestId;
		})
		.addCase(bulkCreateKioskStocks.fulfilled, (state, action) => {
			state.bulkCreateKioskStocks.status = 'success';
			state.bulkCreateKioskStocks.data = action.payload;
			state.bulkCreateKioskStocks.error = null;
			state.bulkCreateKioskStocks.requestId = action.meta.requestId;
		})
		.addCase(bulkCreateKioskStocks.rejected, (state, action) => {
			state.bulkCreateKioskStocks.status = 'error';
			state.bulkCreateKioskStocks.error = action.payload || 'Failed to create kiosk stocks (bulk)';
			state.bulkCreateKioskStocks.requestId = action.meta.requestId;
		});
}

function createKioskStockReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(createKioskStock.pending, (state, action) => {
			state.createKioskStock.status = 'pending';
			state.createKioskStock.error = null;
			state.createKioskStock.requestId = action.meta.requestId;
		})
		.addCase(createKioskStock.fulfilled, (state, action) => {
			state.createKioskStock.status = 'success';
			state.createKioskStock.data = action.payload;
			state.createKioskStock.error = null;
			state.createKioskStock.requestId = action.meta.requestId;
		})
		.addCase(createKioskStock.rejected, (state, action) => {
			state.createKioskStock.status = 'error';
			state.createKioskStock.error = action.payload || 'Failed to create kiosk stock';
			state.createKioskStock.requestId = action.meta.requestId;
		});
}

function kioskStockUpdateReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(updateKioskStock.pending, (state, action) => {
			state.kioskStockUpdate.status = 'pending';
			state.kioskStockUpdate.error = null;
			state.kioskStockUpdate.requestId = action.meta.requestId;
		})
		.addCase(updateKioskStock.fulfilled, (state, action) => {
			state.kioskStockUpdate.status = 'success';
			state.kioskStockUpdate.data = action.payload;
			state.kioskStockUpdate.error = null;
			state.kioskStockUpdate.requestId = action.meta.requestId;
		})
		.addCase(updateKioskStock.rejected, (state, action) => {
			state.kioskStockUpdate.status = 'error';
			state.kioskStockUpdate.error = action.payload || 'Failed to update kiosk stock';
			state.kioskStockUpdate.requestId = action.meta.requestId;
		});
}

function kioskStockDeleteReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(deleteKioskStock.pending, (state, action) => {
			state.kioskStockDelete.status = 'pending';
			state.kioskStockDelete.error = null;
			state.kioskStockDelete.requestId = action.meta.requestId;
		})
		.addCase(deleteKioskStock.fulfilled, (state, action) => {
			state.kioskStockDelete.status = 'success';
			state.kioskStockDelete.data = action.payload;
			state.kioskStockDelete.error = null;
			state.kioskStockDelete.requestId = action.meta.requestId;
		})
		.addCase(deleteKioskStock.rejected, (state, action) => {
			state.kioskStockDelete.status = 'error';
			state.kioskStockDelete.error = action.payload || 'Failed to delete kiosk stock';
			state.kioskStockDelete.requestId = action.meta.requestId;
		});
}

function updateKioskPositionsReducers(builder: ActionReducerMapBuilder<KioskState>) {
	builder
		.addCase(updateKioskPositions.pending, (state, action) => {
			state.kioskPositionsUpdate.status = 'pending';
			state.kioskPositionsUpdate.error = null;
			state.kioskPositionsUpdate.requestId = action.meta.requestId;
		})
		.addCase(updateKioskPositions.fulfilled, (state, action) => {
			state.kioskPositionsUpdate.status = 'success';
			state.kioskPositionsUpdate.data = action.payload;
			state.kioskPositionsUpdate.error = null;
			state.kioskPositionsUpdate.requestId = action.meta.requestId;
		})
		.addCase(updateKioskPositions.rejected, (state, action) => {
			state.kioskPositionsUpdate.status = 'error';
			state.kioskPositionsUpdate.error = action.payload || 'Failed to update kiosk positions';
			state.kioskPositionsUpdate.requestId = action.meta.requestId;
		});
}

export const actions = {
	...kioskSlice.actions,
};

export const { reducer } = kioskSlice;
