import { KioskModel, KioskType, ShelvesConfigWire } from '../kioskModels/types';
import { KioskSetting } from '../kioskSettings';
import { Playlist } from '../mediaPlaylist/types';

import type { Game } from '../games/types';
import type { Theme } from '../themes/types';


export enum UIMode {
	NORMAL = 'normal',
	FOCUS = 'focus',
}

/** API: KioskStatus (openapi / domain) */
export enum KioskStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	DELETED = 'deleted',
}

/** API: KioskMode */
export enum KioskMode {
	PENDING = 'pending',
	SELLING = 'selling',
	SLIDESHOW_ONLY = 'slideshow-only',
}

/** API: KioskInterfaceMode (deprecated) */
/** @deprecated use UIMode instead */
export enum KioskInterfaceMode {
	NORMAL = 'normal',
	FOCUS = 'focus',
}

export enum ConnectionStatus {
	FAST = 'fast',
	SLOW = 'slow',
	LOST = 'lost',
	// DISCONNECTED = 'disconnected',
}

export enum MachineType {
	DROP_PRODUCT = 'dropProduct',
	ELEVATOR = 'elevator',
}

export enum ErrorType {
	DISCONNECTED = 'disconnected',
	DEVICE_ERROR = 'deviceError',
	TEMPERATURE = 'temperature',
	HUMIDITY = 'humidity',
	POWER_CONSUMPTION = 'powerConsumption',
	POWER_CAPACITY = 'powerCapacity',
	SALES_APP_ERROR = 'salesAppError',
	REFUND_ERROR = 'refundError',
	WARNING = 'warning',
}

export enum ErrorStatus {
	PENDING = 'pending',
	RESOLVED = 'resolved',
	IN_PROGRESS = 'inProgress',
}

export interface KioskError {
	id: string;
	kioskId: string;
	kioskCode: string;
	kioskName: string;
	type: ErrorType;
	status: ErrorStatus;
	description: string;
	reportedAt: string;
	resolvedAt?: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
}


export interface CustomerUsage {
	kioskId: string;
	kioskCode: string;
	kioskName: string;
	date: string;
	usageCount: number;
}

export interface OperationParameter {
	kioskId: string;
	timestamp: string;
	temperature: number;
	humidity: number;
	powerConsumption: number;
	cpu?: number;
	redis?: number;
	memory?: number;
}

export interface SupportRequest {
	id: string;
	kioskId: string;
	kioskCode: string;
	kioskName: string;
	customerName: string;
	customerPhone: string;
	description: string;
	status: 'pending' | 'in_progress' | 'resolved';
	createdAt: string;
	resolvedAt?: string;
}

export interface KioskWarning {
	id: string;
	type: string;
	message: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	createdAt: string;
}

export type ConnectionHistory = {
	status: ConnectionStatus,
	createdAt: string,
};

export type KioskConnection = {
	createdAt?: string,
	etag?: string,
	history?: ConnectionHistory[],
	id: string,
	kioskRef?: string,
	lastPing?: string,
	lastStatus?: ConnectionStatus,
	scopeType?: string,
};


/**
 * Kiosk entity (KioskDto + optional UI-only fields from mocks / desktop telemetry).
 */
export interface Kiosk {
	id: string;
	etag: string;
	code: string;
	name: string;
	displayName?: string | null;
	isArchived?: boolean | null;
	status?: KioskStatus | null;
	mode?: KioskMode | null;
	uiMode?: UIMode | null;
	locationAddress?: string | null;
	latitude?: string | null;
	longitude?: string | null;
	connection?: KioskConnection | null;

	// ref (Những field không phải array mới có ref)
	modelRef?: string | null;
	model?: KioskModel | null;
	settingRef?: string | null;
	setting?: KioskSetting;
	themeRef?: string | null;
	theme?: Theme;
	gameRef?: string | null;
	game?: Game;
	shoppingScreenPlaylistRef?: string | null;
	shoppingScreenPlaylist?: Playlist | null;
	waitingScreenPlaylistRef?: string | null;
	waitingScreenPlaylist?: Playlist | null;

	// refs chỉ sử dụng cho create, update; query không có fields refs
	paymentRefs?: string[] | null;
	payments?: any[];
	eventRefs?: string[] | null;
	events?: any[];

	// shelves config
	shelvesNumber?: number | null;
	goodsCollectorType?: KioskType | null;
	shelvesConfig?: ShelvesConfigWire | null;

	// base fields
	scopeType?: string | null;
	createdAt: string;
	updatedAt?: string | null;

	kioskState?: KioskState | null;

	/** UI / telemetry (not on KioskDto) */
	warnings?: KioskWarning[];
	temperature?: number;
	humidity?: number;
	powerConsumption?: number;
	cpu?: number;
	redis?: number;
	memory?: number;
}

export enum KioskActivityLogType {
	WARNING = 'warning',
	STATUS_DETAIL = 'statusDetail',
	ERROR = 'error',
	INFORM = 'inform',
}

export interface KioskActivityLog {
	id: string;
	timestamp: string;
	logType: KioskActivityLogType;
	content: string;
}


export type KioskLog = {
	id: string,
	createdAt: string,
	logType: KioskActivityLogType,
	kioskRef: string,
	message?: string,
	payload?: string,
};



export type KioskState = {
	bucketTime: string,
	createdAt: string,
	current: string,
	energy: string,
	energyDelta: string,
	etag: string,
	homeSwitch: string,
	humidity: string,
	id: string,
	kioskRef: string,
	outputDoorSwitch: string,
	outputSwitch: string,
	power: string,
	scopeType: string,
	temperature: string,
	unidentifiedSwitch: string,
	voltage: number,
};

// "kiosk_state": {
//     "bucket_time": "2026-06-01T04:00:00Z",
//     "created_at": "2026-06-01T04:48:39Z",
//     "current": "0.634",
//     "energy": "29.964",
//     "energy_delta": "0",
//     "etag": "1780289319112477211",
//     "home_switch": "01",
//     "humidity": "51.76",
//     "id": "01KT0R6C681HZMF36RBP9SY1J8",
//     "kiosk_ref": "01K1V9VM000000000000000025",
//     "output_door_switch": "01",
//     "output_switch": "00",
//     "power": "79.4",
//     "scope_type": "domain",
//     "temperature": "29.62",
//     "unidentified_switch": "00",
//     "voltage": 202
//   },

//* ─── Kiosk stock wire types ───────────────────────────────────────────────
//* Relocated from the deleted `kioskService.ts`; `KioskStockService` owns these calls now.

/** POST …/kiosks/:kioskId/kiosk-stocks (Bruno `Kiosk Stock - Create`). */
export type CreateKioskStockBody = {
	productRef: string,
	sortIndex: number,
	sellPrice: string,
	warningQuantity?: number,
};

/** PUT …/kiosks/:kioskId/kiosk-stocks/:id (Bruno `Kiosk Stock - Update`). */
export type UpdateKioskStockBody = {
	etag: string,
	sortIndex: number,
	sellPrice: string,
	warningQuantity?: number,
};

/**
 * [PATCH] …/kiosks/:kioskId/positions/upsert item (wire: snake_case, e.g. stock_ref, is_enabled).
 * Cleared position: only row+col, other fields null.
 */
export type KioskPositionUpdateItem = {
	row: string,
	col: number,
	stockRef: string | null,
	quantity?: number,
	maxQuantity?: number,
	isEnabled?: boolean,
};

/** [PATCH] …/kiosks/:kioskId/kiosk-stocks/bulk body item. */
export type BulkUpdateKioskStockItem = {
	id: string,
	etag: string,
	sortIndex: number,
	warningQuantity?: number,
};

/** Matches Bruno `Kiosk Stock - Replace` body (`stocks` → snake_case on the wire). */
export type KioskStockReplacePosition = {
	row: string,
	col: number,
	quantity: number,
	maxQuantity: number,
	status: 'enable' | 'disable',
};

export type KioskStockReplaceLine = {
	productRef: string,
	sortIndex: number,
	sellPrice: string,
	positions: KioskStockReplacePosition[],
};

export type KioskStockReplaceRequest = {
	stocks: KioskStockReplaceLine[],
};
