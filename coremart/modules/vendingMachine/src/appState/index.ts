import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { eventReducer } from './event';
import { eventAvailableProductReducer } from './eventAvailableProduct';
import { gameReducer } from './game';
import { inventoryReportReducer } from './inventoryReport';
import { kioskReducer } from './kiosk';
import { kioskAvailableProductReducer } from './kioskAvailableProduct';
import { kioskDeviceReducer } from './kioskDevice';
import { kioskMediaReducer } from './kioskMedia';
import { kioskModelReducer } from './kioskModel';
import { kioskProductReducer } from './kioskProduct';
import { kioskSettingReducer } from './kioskSetting';
import { mediaPlaylistReducer } from './mediaPlaylist';
import { operationReportReducer } from './operationReport';
import { paymentReducer } from './payment';
import { refundReportReducer } from './refundReport';
import { revenueReportReducer } from './revenueReport';
import { settingReducer } from './setting';
import { themeReducer } from './theme';
import { vendingOrderReducer } from './vendingOrder';


export const reducer = combineReducers({
	...kioskReducer,
	...kioskMediaReducer,
	...mediaPlaylistReducer,
	...eventReducer,
	...eventAvailableProductReducer,
	...settingReducer,
	...kioskModelReducer,
	...kioskProductReducer,
	...kioskAvailableProductReducer,
	...kioskSettingReducer,
	...kioskDeviceReducer,
	...paymentReducer,
	...themeReducer,
	...gameReducer,
	...vendingOrderReducer,
	...revenueReportReducer,
	...refundReportReducer,
	...inventoryReportReducer,
	...operationReportReducer,
});

export * from './kiosk';
export * from './kioskMedia';
export * from './mediaPlaylist';
export * from './event';
export * from './eventAvailableProduct';
export * from './setting';
export * from './kioskModel';
export * from './kioskProduct';
export * from './kioskAvailableProduct';
export * from './kioskSetting';
export * from './kioskDevice';
export * from './payment';
export * from './vendingOrder';
export * from './theme';
export * from './game';
export * from './revenueReport';
export * from './refundReport';
export * from './inventoryReport';
export * from './operationReport';

export type VendingMachineDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
