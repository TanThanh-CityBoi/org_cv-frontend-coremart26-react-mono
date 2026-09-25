import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DetailLayoutProps } from '../../../../../components/DetailLayout';
import { MediaPlaylistKioskListTab } from '../MediaPlaylistKioskListTab';
import { MediaPlaylistSettingTab } from '../MediaPlaylistSettingTab';

import type { MediaPlaylistDetailTabId } from './types';
import type { Playlist } from '../../../types';




export function useMediaPlaylistDetailTabs(playlist?: Playlist): DetailLayoutProps['tabs'] {
	const { t: translate } = useTranslation('vending_machine');

	return useMemo(() => {
		if (!playlist) return [];
		return [
			{
				id: 'settings' satisfies MediaPlaylistDetailTabId,
				title: translate('media_playlist.tabs.settings'),
				content: () => <MediaPlaylistSettingTab key='settings' playlist={playlist} />,
			},
			{
				id: 'kiosks' satisfies MediaPlaylistDetailTabId,
				title: translate('media_playlist.tabs.kiosk_list'),
				content: () => <MediaPlaylistKioskListTab key='kiosks' playlist={playlist} />,
			},
		];
	}, [playlist, translate]);
}
