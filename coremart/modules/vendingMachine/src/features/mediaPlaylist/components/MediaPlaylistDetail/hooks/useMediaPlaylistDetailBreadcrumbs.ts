import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';

import type { Playlist } from '../../../types';


export function useMediaPlaylistDetailBreadcrumbs(playlist?: Playlist): BreadcrumbItem[] {
	const { t: translate } = useTranslation('vending_machine');
	const pathname = useLocation().pathname;
	const idFromPath = pathname.split('/').pop() ?? '';

	return useMemo(
		() => [
			{ title: translate('title'), href: '../overview' },
			{ title: translate('media_playlist.title'), href: '../media-playlist/playlists' },
			{
				title:
					playlist?.name
					?? (idFromPath ? idFromPath : translate('media_playlist.detail.title')),
				href: '#',
			},
		],
		[translate, playlist?.name, idFromPath],
	);
}
