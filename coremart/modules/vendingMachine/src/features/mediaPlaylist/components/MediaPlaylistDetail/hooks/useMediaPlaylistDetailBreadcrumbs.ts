import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { BreadcrumbItem } from '@/components/BreadCrumbs';

import type { Playlist } from '@/features/mediaPlaylist/types';


export function useMediaPlaylistDetailBreadcrumbs(playlist?: Playlist): BreadcrumbItem[] {
	const { t: translate } = useTranslation();
	const pathname = useLocation().pathname;
	const idFromPath = pathname.split('/').pop() ?? '';

	return useMemo(
		() => [
			{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
			{ title: translate('coremart.vendingMachine.mediaPlaylist.title'), href: '../media-playlist/playlists' },
			{
				title:
					playlist?.name
					?? (idFromPath ? idFromPath : translate('coremart.vendingMachine.mediaPlaylist.detail.title')),
				href: '#',
			},
		],
		[translate, playlist?.name, idFromPath],
	);
}
