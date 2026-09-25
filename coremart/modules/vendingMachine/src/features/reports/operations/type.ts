import { KioskType } from '@/features/kioskModels';
import { KioskProduct } from '@/features/kioskProducts/type';
import { ConnectionStatus, Kiosk, KioskMode } from '@/features/kiosks';
import { GroupTime } from '@/types';


export type OperationStats = {
	totalEnergy: number;
	averageTemperature: number;
	averageHumidity: number;
};

export type KioskAnalytics = {
	timestamp: string;
	temperature: number;
	humidity: number;
	powerConsumption: number;
};

export type KioskStats = {
	archiveStatus: {
		value: 'archived' | 'unarchived';
		count: number;
	}[];
	connectionStatus: {
		value: ConnectionStatus;
		count: number;
	}[];
	goodsCollector: {
		value: KioskType;
		count: number;
	}[];
	operationStatus: {
		value: KioskMode;
		count: number;
	}[];
};

export type LowStockWarning = {
	kiosk: {
		kioskId: string;
		name: string;
		code: string;
	};
	lowStocks: {
		stockId: string;
		productRef: string;
		product: KioskProduct;
		currentQuantity: number;
		maxQuantity: number;
		warningQuantity: number;
	}[];
};

export type KioskVisitor = {
	bucketTime: string;
	bucketType: GroupTime;
	tenantId: string;
	visitorCount: number;
};

export type KioskVisitorQuery = {
	fromDate: string;
	toDate: string;
	bucketType: GroupTime;
	kioskIds?: string[];
	page?: number;
	size?: number;
};

export type KioskAnalyticsQuery = {
	fromDate: string;
	toDate: string;
	bucketType: GroupTime;
	kioskIds?: string[];
	page?: number;
	size?: number;
};


export type KioskStateAnalytic = {
	bucketTime: string;
	bucketType: GroupTime;
	current: number;
	energy: number;
	energyDelta: number;
	homeSwitch: string;
	humidity: number;
	power: number;
	temperature: number;
	tenantId: string;
	unidentifiedSwitch: string;
	voltage: number;
};

export type KioskWarningLevel = 'low' | 'medium' | 'high' | 'critical';

export type KioskWarningStatus = 'waiting' | 'handling' | 'processing' | 'processed';

export type KioskWarning = {
	createdAt: string;
	description: string;
	etag: string;
	id: string;
	kioskRef: string;
	kiosk: Kiosk;
	level: KioskWarningLevel;
	status: KioskWarningStatus;
};

export type KioskWarningQuery = {
	fields?: (keyof KioskWarning)[];
	page?: number;
	size?: number;
};

