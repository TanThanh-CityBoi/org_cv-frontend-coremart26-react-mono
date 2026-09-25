import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '@/components/ControlPanel';

import { useMediaPlaylistDetailTabControl } from '../mediaPlaylistDetailTabControl';
import { useMediaPlaylistDetailBreadcrumbs } from './useMediaPlaylistDetailBreadcrumbs';
import { useMediaPlaylistDetailTabs } from './useMediaPlaylistDetailTabs';

import type { MediaPlaylistDetailTabId, UseMediaPlaylistDetailPageConfigReturn } from './types';
import type { Playlist } from '@/features/mediaPlaylist/types';


function useMediaPlaylistTabActions(activeTab: MediaPlaylistDetailTabId): ControlPanelActionItem[] {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { registry } = useMediaPlaylistDetailTabControl();

	return useMemo<ControlPanelActionItem[]>(() => {
		const baseActions: ControlPanelActionItem[] = [{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../media-playlist/playlists'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];
		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);
}

export function useMediaPlaylistDetailPageConfig(
	{ playlist }: { playlist?: Playlist },
): UseMediaPlaylistDetailPageConfigReturn {
	const [activeTab, setActiveTab] = useState<MediaPlaylistDetailTabId>('settings');
	const onTabChange = useCallback((tab: string) => setActiveTab(tab as MediaPlaylistDetailTabId), []);

	const breadcrumbs = useMediaPlaylistDetailBreadcrumbs(playlist);
	const tabs = useMediaPlaylistDetailTabs(playlist);
	const actions = useMediaPlaylistTabActions(activeTab);

	return useMemo(
		() => ({ breadcrumbs, actions, tabs, activeTab, onTabChange }),
		[breadcrumbs, actions, tabs, activeTab, onTabChange],
	);
}
