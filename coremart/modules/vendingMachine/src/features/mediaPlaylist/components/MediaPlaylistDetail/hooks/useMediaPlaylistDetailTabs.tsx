import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DetailLayoutProps } from '@/components/DetailLayout';

import { MediaPlaylistKioskListTab } from '../MediaPlaylistKioskListTab';
import { MediaPlaylistSettingTab } from '../MediaPlaylistSettingTab';

import type { MediaPlaylistDetailTabId } from './types';
import type { Playlist } from '@/features/mediaPlaylist/types';




export function useMediaPlaylistDetailTabs(playlist?: Playlist): DetailLayoutProps['tabs'] {
	const { t: translate } = useTranslation();

	return useMemo(() => {
		if (!playlist) return [];
		return [
			{
				id: 'settings' satisfies MediaPlaylistDetailTabId,
				title: translate('coremart.vendingMachine.mediaPlaylist.tabs.settings'),
				content: () => <MediaPlaylistSettingTab key='settings' playlist={playlist} />,
			},
			{
				id: 'kiosks' satisfies MediaPlaylistDetailTabId,
				title: translate('coremart.vendingMachine.mediaPlaylist.tabs.kioskList'),
				content: () => <MediaPlaylistKioskListTab key='kiosks' playlist={playlist} />,
			},
		];
	}, [playlist, translate]);
}
