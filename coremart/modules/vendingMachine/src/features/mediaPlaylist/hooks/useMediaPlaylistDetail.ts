import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { mediaPlaylistCrudService } from '../mediaPlaylistCrudService';

import type { Playlist } from '../types';


type GetOneResponse = { item: Playlist };


export function useMediaPlaylistDetail(playlistId?: string) {
	const { dispatchMethod, result } = useServiceLayer<GetOneResponse>(mediaPlaylistCrudService.getById);

	React.useEffect(() => {
		if (playlistId) {
			dispatchMethod({ id: playlistId });
		}
	}, [playlistId, dispatchMethod]);

	return {
		playlist: result.data?.item,
		isLoading: Boolean(playlistId) && result.isPending,
	};
}
