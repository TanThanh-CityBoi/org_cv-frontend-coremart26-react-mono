
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';
import { Kiosk } from '@/features/kiosks';


/** @deprecated */
export type KioskDetailTabId = 'basicInfo' | 'operationalSettings' | 'kioskSetting' | 'productsList' | 'productsGrid' | 'activity';

export enum KioskDetailTabs {
	BASIC_INFO = 'basicInfo',
	OPERATIONAL_SETTINGS = 'operationalSettings',
	DISPLAY_SETTINGS = 'displaySettings',
	STOCK_LIST = 'stockList',
	STOCK_GRID = 'stockGrid',
	ACTIVITY = 'activity',
}

export type UseKioskDetailPageConfigProps = {
	kiosk?: Kiosk;
};

export type UseKioskDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
	activeTab: KioskDetailTabs;
	onTabChange: (tab: KioskDetailTabs) => void;
};
