
import { snakeToCamelCase } from '@nikkierp/common/utils';


import { mockProducts } from './mockProducts';
import { deriveEventRunPhase } from './types';
import { SearchOperator } from '../../types';

import type { Event, EventCreateFormData, EventStock, EventUpdatePatch } from './types';
import type {
	PagedSearchResponse,
	RestArchiveResponse,
	SearchGraph,
	SearchNode,
	SearchParams,
} from '../../types';
import type { Kiosk } from '../kiosks/types';


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function catalogStocks(evId: string, take: number): EventStock[] {
	return mockProducts.slice(0, take).map((p, index) => ({
		id: `stk-${evId}-${p.id}`,
		etag: `e-stk-${evId}-${index}`,
		eventRef: evId,
		productRef: p.id,
		sellPrice: p.suggestedSellPrice,
	}));
}

const sampleKiosks: Kiosk[] = [
	{
		id: '1',
		etag: 'k-1',
		code: 'KIOSK-001',
		name: 'Kiosk Trung Tâm',
		isArchived: false,
		createdAt: '2024-01-15T08:00:00Z',
	},
	{
		id: '2',
		etag: 'k-2',
		code: 'KIOSK-002',
		name: 'Kiosk Sân Bay',
		isArchived: false,
		createdAt: '2024-02-10T08:00:00Z',
	},
];

const mockEventsData: Event[] = [
	{
		id: '1',
		code: 'EVT-001',
		name: 'Sự kiện Giảm giá Black Friday',
		description: 'Sự kiện giảm giá lớn nhất năm',
		isArchived: false,
		startTime: '2026-02-04T00:00:00Z',
		endTime: '2026-12-06T23:59:59Z',
		dailyStartTime: '08:00',
		dailyEndTime: '22:00',
		isAllDay: false,
		shoppingScreenPlaylistRef: null,
		waitingScreenPlaylistRef: null,
		themeRef: null,
		gameRef: null,
		stocks: catalogStocks('1', 3),
		kiosks: sampleKiosks,
		createdAt: '2024-10-01T08:00:00Z',
		etag: 'etag-evt-001',
	},
	{
		id: '2',
		code: 'EVT-002',
		name: 'Sự kiện Tết Nguyên Đán',
		description: 'Chương trình khuyến mãi đặc biệt dịp Tết',
		isArchived: false,
		startTime: '2024-01-20T00:00:00Z',
		endTime: '2024-02-05T23:59:59Z',
		dailyStartTime: '07:30',
		dailyEndTime: '22:30',
		isAllDay: false,
		createdAt: '2023-12-15T09:30:00Z',
		etag: 'etag-evt-002',
	},
	{
		id: '3',
		code: 'EVT-003',
		name: 'Sự kiện Mùa hè',
		description: 'Giảm giá các mặt hàng mùa hè',
		isArchived: false,
		startTime: '2024-06-01T00:00:00Z',
		endTime: '2024-08-31T23:59:59Z',
		dailyStartTime: '09:00',
		dailyEndTime: '21:00',
		isAllDay: false,
		createdAt: '2024-05-15T10:15:00Z',
		etag: 'etag-evt-003',
	},
	{
		id: '4',
		code: 'EVT-004',
		name: 'Sự kiện Back to School',
		isArchived: false,
		startTime: '2024-08-15T00:00:00Z',
		endTime: '2024-09-15T23:59:59Z',
		dailyStartTime: '08:00',
		dailyEndTime: '20:00',
		isAllDay: false,
		createdAt: '2024-07-20T14:20:00Z',
		etag: 'etag-evt-004',
	},
	{
		id: '5',
		code: 'EVT-005',
		name: 'Sự kiện Trung thu',
		isArchived: false,
		startTime: '2024-09-10T00:00:00Z',
		endTime: '2024-09-20T23:59:59Z',
		dailyStartTime: '10:00',
		dailyEndTime: '22:00',
		isAllDay: false,
		createdAt: '2024-08-25T11:45:00Z',
		etag: 'etag-evt-005',
	},
	{
		id: '6',
		code: 'EVT-006',
		name: 'Sự kiện Giáng sinh',
		isArchived: false,
		startTime: '2024-12-20T00:00:00Z',
		endTime: '2025-01-05T23:59:59Z',
		dailyStartTime: '08:30',
		dailyEndTime: '23:59',
		isAllDay: false,
		createdAt: '2024-11-30T13:30:00Z',
		etag: 'etag-evt-006',
	},
	{
		id: '7',
		code: 'EVT-007',
		name: 'Sự kiện Valentine',
		isArchived: false,
		startTime: '2024-02-10T00:00:00Z',
		endTime: '2024-02-17T23:59:59Z',
		dailyStartTime: '11:00',
		dailyEndTime: '23:30',
		isAllDay: false,
		createdAt: '2024-01-25T15:00:00Z',
		etag: 'etag-evt-007',
	},
	{
		id: '8',
		code: 'EVT-008',
		name: 'Sự kiện Quốc khánh',
		description: 'Archived kiosk event demo (future end, inactive UX).',
		isArchived: true,
		startTime: '2024-09-01T00:00:00Z',
		endTime: '2027-09-05T23:59:59Z',
		dailyStartTime: '00:01',
		dailyEndTime: '23:59',
		isAllDay: false,
		createdAt: '2024-08-15T16:20:00Z',
		etag: 'etag-evt-008',
	},
];

function cloneEventRow(e: Event): Event {
	return JSON.parse(JSON.stringify(e)) as Event;
}

function getEventSnakeField(e: Event, snakeField: string): string {
	if (snakeField === 'status' || snakeField === 'run_phase') return deriveEventRunPhase(e);
	const key = snakeToCamelCase(snakeField) as keyof Event;
	const v = e[key];
	return v == null ? '' : String(v);
}

function matchEventIf(ev: Event, triple: NonNullable<SearchNode['if']>): boolean {
	const [field, op, val] = triple;
	const vs = (x: unknown) => String(x ?? '');
	if (op === SearchOperator.CONTAINS) {
		return getEventSnakeField(ev, field).toLowerCase().includes(vs(val).toLowerCase());
	}
	if (op === SearchOperator.EQUAL) {
		return getEventSnakeField(ev, field) === vs(val);
	}
	return true;
}

function matchesEventNode(ev: Event, node: SearchNode): boolean {
	if (node.if) return matchEventIf(ev, node.if);
	if (node.or?.length) return node.or.some((child) => matchesEventNode(ev, child));
	if (node.and?.length) return node.and.every((child) => matchesEventNode(ev, child));
	return true;
}

function filterEventsByGraph(rows: Event[], graph?: SearchGraph): Event[] {
	if (graph == null || Object.keys(graph).length === 0) return rows;
	if (graph.and?.length) return rows.filter((e) => graph.and!.every((n) => matchesEventNode(e, n)));
	if (graph.or?.length) return rows.filter((e) => graph.or!.some((n) => matchesEventNode(e, n)));
	if (graph.if) return rows.filter((e) => matchEventIf(e, graph.if!));
	return rows;
}

export const mockEvents = {
	async searchEvents(params?: SearchParams<Event>): Promise<PagedSearchResponse<Event>> {
		await delay(400);
		const filtered = filterEventsByGraph(mockEventsData.map(cloneEventRow), params?.graph);
		const page = params?.page ?? 0;
		const size = params?.size ?? 10;
		const total = filtered.length;
		const start = page * size;
		const items = filtered.slice(start, start + size).map(cloneEventRow);
		return { items, total, page, size };
	},

	async getEvent(id: string): Promise<Event | undefined> {
		await delay(300);
		const row = mockEventsData.find((e) => e.id === id);
		return row ? cloneEventRow(row) : undefined;
	},

	async createEvent(body: EventCreateFormData): Promise<Event> {
		await delay(500);
		const newEvent: Event = {
			id: String(mockEventsData.length + 100),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			etag: `etag-evt-${Date.now()}`,
			isArchived: false,
			...body,
		};
		mockEventsData.push(newEvent);
		return cloneEventRow(newEvent);
	},

	async updateEvent(
		id: string,
		_etag: string,
		updates: EventUpdatePatch,
	): Promise<Event> {
		await delay(400);
		const index = mockEventsData.findIndex((e) => e.id === id);
		if (index === -1) {
			throw new Error('Event not found');
		}
		const prev = mockEventsData[index];
		const next: Event = {
			...prev,
			...updates,
			updatedAt: new Date().toISOString(),
			etag: `etag-evt-${Date.now()}`,
		};
		mockEventsData[index] = next;
		return cloneEventRow(next);
	},

	async deleteEvent(id: string): Promise<void> {
		await delay(400);
		const index = mockEventsData.findIndex((e) => e.id === id);
		if (index === -1) {
			throw new Error('Event not found');
		}
		mockEventsData.splice(index, 1);
	},

	async setArchivedEvent(
		id: string,
		payload: { etag: string, isArchived: boolean },
	): Promise<RestArchiveResponse> {
		await delay(400);
		const index = mockEventsData.findIndex((e) => e.id === id);
		if (index === -1) {
			throw new Error('Event not found');
		}
		const row = mockEventsData[index];
		const etag = `etag-evt-${Date.now()}`;
		mockEventsData[index] = {
			...row,
			isArchived: payload.isArchived,
			etag,
			updatedAt: new Date().toISOString(),
		};
		return {
			affectedCount: 1,
			affectedAt: new Date().toISOString(),
			etag,
		};
	},
};
