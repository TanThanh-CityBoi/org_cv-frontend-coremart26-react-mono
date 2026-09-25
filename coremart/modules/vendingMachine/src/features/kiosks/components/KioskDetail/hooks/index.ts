export type {
	KioskDetailTabId,
	UseKioskDetailPageConfigProps,
	UseKioskDetailPageConfigReturn,
} from './types';
export { useBasicInfoTab } from './useBasicInfoTab';
export { useKioskDetailBreadcrumbs } from './useKioskDetailBreadcrumbs';
export { useKioskDetailPageConfig } from './useKioskDetailPageConfig';
export {
	buildKioskSettingActions,
	useKioskSettingTab,
} from './useKioskSettingTab';
export type {
	UseKioskSettingTabReturn,
	KioskSettingFormData,
	KioskSettingPickerValues,
} from './useKioskSettingTab';
export {
	buildProductsGridActions,
	useKioskStockGridTab,
} from './useKioskStockGridTab';
export type { UseKioskStockGridTabArgs, UseKioskStockGridTabReturn } from './useKioskStockGridTab';
export * from './useKioskStockListTab';
export * from './useKioskOperationalSettingTab';