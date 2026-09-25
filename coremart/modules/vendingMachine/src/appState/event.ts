import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listEvents,
	getEvent,
	createEvent,
	updateEvent,
	deleteEvent,
	setArchivedEvent,
	fetchEventStocks,
	listKiosksInEvent,
	manageEventKiosks,
	createEventStock,
	bulkCreateEventStock,
	updateEventStock,
	deleteEventStock,
	EventState,
	initialEventState,
} from '@/features/events/eventSlice';


const STATE_KEY = 'event';

export const eventReducer = {
	[STATE_KEY]: reducer,
};

export const eventActions = {
	listEvents,
	getEvent,
	createEvent,
	updateEvent,
	deleteEvent,
	setArchivedEvent,
	fetchEventStocks,
	listKiosksInEvent,
	manageEventKiosks,
	createEventStock,
	bulkCreateEventStock,
	updateEventStock,
	deleteEventStock,
	...actions,
};

export const selectEventState = (state: { [STATE_KEY]?: EventState }) => state?.[STATE_KEY] ?? initialEventState;

export const selectEventList = createSelector(
	selectEventState,
	(state) => state.list,
);

export const selectEventDetail = createSelector(
	selectEventState,
	(state) => state.detail,
);

export const selectCreateEvent = createSelector(
	selectEventState,
	(state) => state.create,
);

export const selectUpdateEvent = createSelector(
	selectEventState,
	(state) => state.update,
);

export const selectDeleteEvent = createSelector(
	selectEventState,
	(state) => state.delete,
);

export const selectEventArchiveOutcome = createSelector(
	selectEventState,
	(state) => state.archive,
);

export const selectEventStocks = createSelector(
	selectEventState,
	(state) => state.eventStocks,
);

export const selectKioskListInEvent = createSelector(
	selectEventState,
	(state) => state.kioskListInEvent,
);

export const selectManageEventKiosksOutcome = createSelector(
	selectEventState,
	(state) => state.manageEventKiosks,
);

export const selectCreateEventStock = createSelector(
	selectEventState,
	(state) => state.createEventStock,
);

export const selectBulkCreateEventStock = createSelector(
	selectEventState,
	(state) => state.bulkCreateEventStock,
);

export const selectEventStockUpdate = createSelector(
	selectEventState,
	(state) => state.eventStockUpdate,
);

export const selectEventStockDelete = createSelector(
	selectEventState,
	(state) => state.eventStockDelete,
);
