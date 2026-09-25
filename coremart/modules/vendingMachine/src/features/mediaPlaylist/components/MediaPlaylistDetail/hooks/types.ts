import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { DetailLayoutProps } from '@/components/DetailLayout';


export type MediaPlaylistDetailTabId = 'settings' | 'kiosks';

export type UseMediaPlaylistDetailPageConfigReturn = {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
	tabs: DetailLayoutProps['tabs'];
	activeTab: MediaPlaylistDetailTabId;
	onTabChange: (tab: MediaPlaylistDetailTabId) => void;
};
