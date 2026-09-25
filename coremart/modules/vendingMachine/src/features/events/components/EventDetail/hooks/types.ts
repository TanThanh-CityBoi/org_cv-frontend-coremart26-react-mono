import type { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import type { ControlPanelProps } from '../../../../../components/ControlPanel/ControlPanel';
import type { DetailLayoutProps } from '../../../../../components/DetailLayout';
import type { Event } from '../../../types';


export type EventDetailTabId = 'basicInfo' | 'ui' | 'products' | 'kiosks';

export type UseEventDetailPageConfigProps = {
	event?: Event,
};

export type UseEventDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[],
	actions: ControlPanelProps['actions'],
	tabs: DetailLayoutProps['tabs'],
	activeTab: EventDetailTabId,
	onTabChange: (tab: EventDetailTabId) => void,
};
