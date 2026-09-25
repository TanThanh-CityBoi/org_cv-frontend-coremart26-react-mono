import { baseReduxActionState, ReduxActionState } from '@nikkierp/ui/appState';
import {
	ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';

import { kioskService } from '@/features/kiosks/kioskService';
import {
	type PagedReduxState,
	type PagedSearchResponse,
	type RestArchiveResponse,
	type RestCreateResponse,
	type RestDeleteResponse,
	type SearchParams,
	type RestUpdateResponse,
	basePagedReduxState,
	SearchOrder,
} from '@/types';
import { SortDirection } from '@/types/search-graph';

import { eventService } from './eventService';
import {
	eventStockService,
	type CreateEventStockBody,
	type UpdateEventStockBody,
} from './eventStockService';

import type { Event, EventCreateFormData, EventStock, EventUpdatePatch } from './types';
import type { Kiosk } from '@/features/kiosks/types';


export const SLICE_NAME = 'vendingMachine.event';

export type EventState = {
	detail: ReduxActionState<Event>;
	list: PagedReduxState<Event>;
	create: ReduxActionState<RestCreateResponse>;
	update: ReduxActionState<RestUpdateResponse>;
	delete: ReduxActionState<RestDeleteResponse>;
	archive: ReduxActionState<RestArchiveResponse>;
	eventStocks: PagedReduxState<EventStock>;
	eventStocksQuery: EventStockQuery | null;
	createEventStock: ReduxActionState<RestCreateResponse>;
	bulkCreateEventStock: ReduxActionState<RestCreateResponse[]>;
	eventStockUpdate: ReduxActionState<RestUpdateResponse>;
	eventStockDelete: ReduxActionState<RestDeleteResponse>;
	kioskListInEvent: PagedReduxState<Kiosk>;
	manageEventKiosks: ReduxActionState<RestUpdateResponse>;
};

export type EventStockQuery = { eventId: string; page?: number; size?: number };

/** Tracks which event the paged kiosk list belongs to (tab-scoped search). */
export type EventKioskListQuery = { eventId: string; page?: number; size?: number };

export const EVENT_KIOSK_LIST_DEFAULT_SIZE = 10;

/** Kiosk search fields for event-detail kiosks tab (aligned with kiosk-setting list). */
export const EVENT_KIOSK_LIST_FIELDS: Array<keyof Kiosk> = [
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
	// 'connections',
	'createdAt',
	'updatedAt',
];

export const EVENT_DEFAULT_PAGE_SIZE = 10;

/** Fields GET …/:id expands for detail tabs (Bruno repeats `fields=…`). */
const EVENT_DETAIL_GET_FIELDS: Array<keyof Event> = [
	'id',
	'etag',
	'code',
	'name',
	'description',
	'startTime',
	'endTime',
	'dailyStartTime',
	'dailyEndTime',
	'isAllDay',
	'shoppingScreenPlaylistRef',
	'waitingScreenPlaylistRef',
	'themeRef',
	'gameRef',
	'isArchived',
	'scopeType',
	'scopeRef',
	'createdAt',
	'updatedAt',
	'theme',
	'game',
	'shoppingScreenPlaylist',
	'waitingScreenPlaylist',
];

/** List grid / search defaults (narrow fetch like `listKiosks`). */
const EVENT_LIST_GET_FIELDS: Array<keyof Event> = [
	'id',
	'etag',
	'code',
	'name',
	'description',
	'startTime',
	'endTime',
	'dailyStartTime',
	'dailyEndTime',
	'isAllDay',
	'isArchived',
	'shoppingScreenPlaylistRef',
	'waitingScreenPlaylistRef',
	'themeRef',
	'gameRef',
	'scopeType',
	'scopeRef',
	'createdAt',
	'updatedAt',
];

export const initialEventState: EventState = {
	detail: baseReduxActionState,
	list: basePagedReduxState(EVENT_DEFAULT_PAGE_SIZE),
	create: baseReduxActionState,
	update: baseReduxActionState,
	delete: baseReduxActionState,
	archive: baseReduxActionState,
	eventStocks: basePagedReduxState(10),
	eventStocksQuery: null,
	createEventStock: baseReduxActionState,
	bulkCreateEventStock: baseReduxActionState,
	eventStockUpdate: baseReduxActionState,
	eventStockDelete: baseReduxActionState,
	kioskListInEvent: basePagedReduxState(EVENT_KIOSK_LIST_DEFAULT_SIZE),
	manageEventKiosks: baseReduxActionState,
};


export const listEvents = createAsyncThunk<
	PagedSearchResponse<Event>,
	SearchParams<Event> | void,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listEvents`,
	async (params, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await eventService.searchEvents({
				fields: EVENT_LIST_GET_FIELDS,
				...(params || {}),
				graph: { order, ...((params || {}).graph || {}) },
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list events';
			return rejectWithValue(errorMessage);
		}
	},
);

export const getEvent = createAsyncThunk<Event | undefined, string, { rejectValue: string }>(
	`${SLICE_NAME}/getEvent`,
	async (id, { rejectWithValue }) => {
		try {
			return await eventService.getEvent(id, EVENT_DETAIL_GET_FIELDS);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to get event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createEvent = createAsyncThunk<
	RestCreateResponse,
	EventCreateFormData,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createEvent`,
	async (body, { rejectWithValue }) => {
		try {
			return await eventService.createEvent(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateEvent = createAsyncThunk<
	RestUpdateResponse,
	{ id: string; etag: string; updates: EventUpdatePatch },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateEvent`,
	async ({ id, etag, updates }, { rejectWithValue }) => {
		try {
			return await eventService.updateEvent(id, etag, updates);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteEvent = createAsyncThunk<
	RestDeleteResponse,
	{ id: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteEvent`,
	async ({ id }, { rejectWithValue }) => {
		try {
			return await eventService.deleteEvent(id);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const setArchivedEvent = createAsyncThunk<
	RestArchiveResponse,
	{ id: string; etag: string; isArchived: boolean },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/setArchivedEvent`,
	async ({ id, etag, isArchived }, { rejectWithValue }) => {
		try {
			return await eventService.setArchivedEvent(id, { etag, isArchived });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to archive event';
			return rejectWithValue(errorMessage);
		}
	},
);

export const listKiosksInEvent = createAsyncThunk<
	PagedSearchResponse<Kiosk>,
	SearchParams<Kiosk>,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/listKiosksInEvent`,
	async ({ page, size, graph, extra }, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await kioskService.searchKiosks({
				fields: EVENT_KIOSK_LIST_FIELDS,
				page: page ?? 0,
				size: size ?? EVENT_KIOSK_LIST_DEFAULT_SIZE,
				graph: { order, ...(graph || {}) },
				...(extra ? { extra } : {}),
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to list kiosks for event';
			return rejectWithValue(errorMessage);
		}
	},
);


export type ManageEventKiosksRequest = {
	eventId: string;
	add: string[];
	remove: string[];
};

export const manageEventKiosks = createAsyncThunk<
	RestUpdateResponse,
	ManageEventKiosksRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/manageEventKiosks`,
	async ({ eventId, add, remove }, { rejectWithValue }) => {
		try {
			return await eventService.manageEventKiosks(eventId, { add, remove });
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to manage event kiosks';
			return rejectWithValue(errorMessage);
		}
	},
);


const EVENT_STOCK_SEARCH_FIELDS: Array<keyof EventStock> = [
	'id',
	'etag',
	'eventRef',
	'productRef',
	'sellPrice',
	'scopeType',
	'scopeRef',
];

export const fetchEventStocks = createAsyncThunk<
	PagedSearchResponse<EventStock>,
	EventStockQuery,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/fetchEventStocks`,
	async ({ eventId, page, size }, { rejectWithValue }) => {
		try {
			const order: SearchOrder[] = [['created_at', SortDirection.DESC]];
			return await eventStockService.searchEventStocks(eventId, {
				fields: EVENT_STOCK_SEARCH_FIELDS,
				page: page ?? 0,
				size: size ?? 10,
				graph: { order },
			});
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load event stocks';
			return rejectWithValue(errorMessage);
		}
	},
);

export const createEventStock = createAsyncThunk<
	RestCreateResponse,
	CreateEventStockBody,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/createEventStock`,
	async (body, { rejectWithValue }) => {
		try {
			return await eventStockService.createEventStock(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create event stock';
			return rejectWithValue(errorMessage);
		}
	},
);

export type BulkCreateEventStockItem = Pick<CreateEventStockBody, 'productRef' | 'sellPrice'>;

export type BulkCreateEventStocksRequest = {
	eventId: string;
	items: BulkCreateEventStockItem[];
};

export const bulkCreateEventStock = createAsyncThunk<
	RestCreateResponse[],
	BulkCreateEventStocksRequest,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/bulkCreateEventStock`,
	async ({ eventId, items }, { rejectWithValue }) => {
		try {
			return await eventStockService.bulkCreateEventStock(eventId, items);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create event stocks (bulk)';
			return rejectWithValue(errorMessage);
		}
	},
);

export const updateEventStock = createAsyncThunk<
	RestUpdateResponse,
	UpdateEventStockBody,
	{ rejectValue: string }
>(
	`${SLICE_NAME}/updateEventStock`,
	async (body, { rejectWithValue }) => {
		try {
			return await eventStockService.updateEventStock(body);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update event stock';
			return rejectWithValue(errorMessage);
		}
	},
);

export const deleteEventStock = createAsyncThunk<
	RestDeleteResponse,
	{ eventId: string; stockId: string },
	{ rejectValue: string }
>(
	`${SLICE_NAME}/deleteEventStock`,
	async ({ eventId, stockId }, { rejectWithValue }) => {
		try {
			return await eventStockService.deleteEventStock(eventId, stockId);
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete event stock';
			return rejectWithValue(errorMessage);
		}
	},
);

const eventSlice = createSlice({
	name: SLICE_NAME,
	initialState: initialEventState,
	reducers: {
		setEvents: (state, action: PayloadAction<Event[]>) => {
			state.list.items = action.payload;
		},
		resetCreateEvent: (state) => {
			state.create = baseReduxActionState;
		},
		resetUpdateEvent: (state) => {
			state.update = baseReduxActionState;
		},
		resetDeleteEvent: (state) => {
			state.delete = baseReduxActionState;
		},
		resetArchiveEvent: (state) => {
			state.archive = baseReduxActionState;
		},
		resetCreateEventStock: (state) => {
			state.createEventStock = baseReduxActionState;
		},
		resetBulkCreateEventStock: (state) => {
			state.bulkCreateEventStock = baseReduxActionState;
		},
		resetEventStockUpdate: (state) => {
			state.eventStockUpdate = baseReduxActionState;
		},
		resetEventStockDelete: (state) => {
			state.eventStockDelete = baseReduxActionState;
		},
		resetManageEventKiosks: (state) => {
			state.manageEventKiosks = baseReduxActionState;
		},
	},
	extraReducers: (builder) => {
		listEventsReducers(builder);
		getEventReducers(builder);
		createEventReducers(builder);
		updateEventReducers(builder);
		deleteEventReducers(builder);
		setArchivedEventReducers(builder);
		fetchEventStocksReducers(builder);
		listKiosksInEventReducers(builder);
		manageEventKiosksReducers(builder);
		createEventStockReducers(builder);
		bulkCreateEventStockReducers(builder);
		eventStockUpdateReducers(builder);
		eventStockDeleteReducers(builder);
	},
});

function listEventsReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(listEvents.pending, (state, action) => {
			state.list.status = 'pending';
			state.list.error = null;
			state.list.requestId = action.meta.requestId;
		})
		.addCase(listEvents.fulfilled, (state, action) => {
			state.list.status = 'success';
			state.list.items = action.payload.items;
			state.list.error = null;
			state.list.total = action.payload.total;
			state.list.page = action.payload.page;
			state.list.size = action.payload.size;
			state.list.requestId = action.meta.requestId;
		})
		.addCase(listEvents.rejected, (state, action) => {
			state.list.status = 'error';
			state.list.error = action.payload || 'Failed to list events';
			state.list.items = [];
			state.list.requestId = action.meta.requestId;
		});
}

function getEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(getEvent.pending, (state, action) => {
			state.detail.status = 'pending';
			state.detail.error = null;
			const requestedId = action.meta.arg;
			if (state.detail.data?.id !== requestedId) {
				state.detail.data = undefined;
			}
			state.detail.requestId = action.meta.requestId;
		})
		.addCase(getEvent.fulfilled, (state, action) => {
			state.detail.status = 'success';
			state.detail.data = action.payload;
			state.detail.error = null;
			state.detail.requestId = action.meta.requestId;
		})
		.addCase(getEvent.rejected, (state, action) => {
			state.detail.status = 'error';
			state.detail.error = action.payload || 'Failed to get event';
			state.detail.data = undefined;
			state.detail.requestId = action.meta.requestId;
		});
}

function createEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(createEvent.pending, (state, action) => {
			state.create.status = 'pending';
			state.create.error = null;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createEvent.fulfilled, (state, action) => {
			state.create.status = 'success';
			state.create.data = action.payload;
			state.create.requestId = action.meta.requestId;
		})
		.addCase(createEvent.rejected, (state, action) => {
			state.create.status = 'error';
			state.create.error = action.payload || 'Failed to create event';
			state.create.requestId = action.meta.requestId;
		});
}

function updateEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(updateEvent.pending, (state, action) => {
			state.update.status = 'pending';
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateEvent.fulfilled, (state, action) => {
			state.update.status = 'success';
			state.update.data = action.payload;
			state.update.error = null;
			state.update.requestId = action.meta.requestId;
		})
		.addCase(updateEvent.rejected, (state, action) => {
			state.update.status = 'error';
			state.update.error = action.payload || 'Failed to update event';
			state.update.requestId = action.meta.requestId;
		});
}

function deleteEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(deleteEvent.pending, (state, action) => {
			state.delete.status = 'pending';
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteEvent.fulfilled, (state, action) => {
			state.delete.status = 'success';
			state.delete.data = action.payload;
			state.delete.error = null;
			state.delete.requestId = action.meta.requestId;
		})
		.addCase(deleteEvent.rejected, (state, action) => {
			state.delete.status = 'error';
			state.delete.error = action.payload || 'Failed to delete event';
			state.delete.requestId = action.meta.requestId;
		});
}

function setArchivedEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(setArchivedEvent.pending, (state, action) => {
			state.archive.status = 'pending';
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedEvent.fulfilled, (state, action) => {
			state.archive.status = 'success';
			state.archive.data = action.payload;
			state.archive.error = null;
			state.archive.requestId = action.meta.requestId;
		})
		.addCase(setArchivedEvent.rejected, (state, action) => {
			state.archive.status = 'error';
			state.archive.error = action.payload || 'Failed to archive event';
			state.archive.requestId = action.meta.requestId;
		});
}

function fetchEventStocksReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(fetchEventStocks.pending, (state, action) => {
			state.eventStocks.status = 'pending';
			state.eventStocks.error = null;
			const { eventId } = action.meta.arg;
			if (state.eventStocksQuery?.eventId !== eventId) {
				state.eventStocks.items = [];
			}
			state.eventStocksQuery = action.meta.arg;
			state.eventStocks.requestId = action.meta.requestId;
		})
		.addCase(fetchEventStocks.fulfilled, (state, action) => {
			state.eventStocks.status = 'success';
			state.eventStocks.items = action.payload.items;
			state.eventStocks.error = null;
			state.eventStocks.total = action.payload.total;
			state.eventStocks.page = action.payload.page;
			state.eventStocks.size = action.payload.size;
			state.eventStocks.requestId = action.meta.requestId;
		})
		.addCase(fetchEventStocks.rejected, (state, action) => {
			state.eventStocks.status = 'error';
			state.eventStocks.error = action.payload || 'Failed to load event stocks';
			state.eventStocks.items = [];
			state.eventStocks.total = 0;
			state.eventStocks.page = 0;
			state.eventStocks.requestId = action.meta.requestId;
		});
}

function listKiosksInEventReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(listKiosksInEvent.pending, (state, action) => {
			state.kioskListInEvent.status = 'pending';
			state.kioskListInEvent.error = null;
			state.kioskListInEvent.requestId = action.meta.requestId;
		})
		.addCase(listKiosksInEvent.fulfilled, (state, action) => {
			state.kioskListInEvent.status = 'success';
			state.kioskListInEvent.items = action.payload.items;
			state.kioskListInEvent.error = null;
			state.kioskListInEvent.total = action.payload.total;
			state.kioskListInEvent.page = action.payload.page;
			state.kioskListInEvent.size = action.payload.size;
			state.kioskListInEvent.requestId = action.meta.requestId;
		})
		.addCase(listKiosksInEvent.rejected, (state, action) => {
			state.kioskListInEvent.status = 'error';
			state.kioskListInEvent.error = action.payload || 'Failed to list kiosks for event';
			state.kioskListInEvent.items = [];
			state.kioskListInEvent.total = 0;
			state.kioskListInEvent.page = 0;
			state.kioskListInEvent.requestId = action.meta.requestId;
		});
}

function manageEventKiosksReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(manageEventKiosks.pending, (state, action) => {
			state.manageEventKiosks.status = 'pending';
			state.manageEventKiosks.error = null;
			state.manageEventKiosks.requestId = action.meta.requestId;
		})
		.addCase(manageEventKiosks.fulfilled, (state, action) => {
			state.manageEventKiosks.status = 'success';
			state.manageEventKiosks.data = action.payload;
			state.manageEventKiosks.error = null;
			state.manageEventKiosks.requestId = action.meta.requestId;
		})
		.addCase(manageEventKiosks.rejected, (state, action) => {
			state.manageEventKiosks.status = 'error';
			state.manageEventKiosks.error = action.payload || 'Failed to manage event kiosks';
			state.manageEventKiosks.requestId = action.meta.requestId;
		});
}

function createEventStockReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(createEventStock.pending, (state, action) => {
			state.createEventStock.status = 'pending';
			state.createEventStock.error = null;
			state.createEventStock.requestId = action.meta.requestId;
		})
		.addCase(createEventStock.fulfilled, (state, action) => {
			state.createEventStock.status = 'success';
			state.createEventStock.data = action.payload;
			state.createEventStock.error = null;
			state.createEventStock.requestId = action.meta.requestId;
		})
		.addCase(createEventStock.rejected, (state, action) => {
			state.createEventStock.status = 'error';
			state.createEventStock.error = action.payload || 'Failed to create event stock';
			state.createEventStock.requestId = action.meta.requestId;
		});
}

function bulkCreateEventStockReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(bulkCreateEventStock.pending, (state, action) => {
			state.bulkCreateEventStock.status = 'pending';
			state.bulkCreateEventStock.error = null;
			state.bulkCreateEventStock.requestId = action.meta.requestId;
		})
		.addCase(bulkCreateEventStock.fulfilled, (state, action) => {
			state.bulkCreateEventStock.status = 'success';
			state.bulkCreateEventStock.data = action.payload;
			state.bulkCreateEventStock.error = null;
			state.bulkCreateEventStock.requestId = action.meta.requestId;
		})
		.addCase(bulkCreateEventStock.rejected, (state, action) => {
			state.bulkCreateEventStock.status = 'error';
			state.bulkCreateEventStock.error = action.payload || 'Failed to create event stocks (bulk)';
			state.bulkCreateEventStock.requestId = action.meta.requestId;
		});
}

function eventStockUpdateReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(updateEventStock.pending, (state, action) => {
			state.eventStockUpdate.status = 'pending';
			state.eventStockUpdate.error = null;
			state.eventStockUpdate.requestId = action.meta.requestId;
		})
		.addCase(updateEventStock.fulfilled, (state, action) => {
			state.eventStockUpdate.status = 'success';
			state.eventStockUpdate.data = action.payload;
			state.eventStockUpdate.error = null;
			state.eventStockUpdate.requestId = action.meta.requestId;
		})
		.addCase(updateEventStock.rejected, (state, action) => {
			state.eventStockUpdate.status = 'error';
			state.eventStockUpdate.error = action.payload || 'Failed to update event stock';
			state.eventStockUpdate.requestId = action.meta.requestId;
		});
}

function eventStockDeleteReducers(builder: ActionReducerMapBuilder<EventState>) {
	builder
		.addCase(deleteEventStock.pending, (state, action) => {
			state.eventStockDelete.status = 'pending';
			state.eventStockDelete.error = null;
			state.eventStockDelete.requestId = action.meta.requestId;
		})
		.addCase(deleteEventStock.fulfilled, (state, action) => {
			state.eventStockDelete.status = 'success';
			state.eventStockDelete.data = action.payload;
			state.eventStockDelete.error = null;
			state.eventStockDelete.requestId = action.meta.requestId;
		})
		.addCase(deleteEventStock.rejected, (state, action) => {
			state.eventStockDelete.status = 'error';
			state.eventStockDelete.error = action.payload || 'Failed to delete event stock';
			state.eventStockDelete.requestId = action.meta.requestId;
		});
}


export const actions = {
	...eventSlice.actions,
};

export const { reducer } = eventSlice;
