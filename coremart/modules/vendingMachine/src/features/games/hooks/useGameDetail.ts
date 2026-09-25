import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { gameCrudService } from '../gameService';

import type { Game } from '../types';


export function useGameDetail(gameId: string | undefined) {
	const { dispatchMethod, result } = useServiceLayer<Game>(gameCrudService.getById);

	React.useEffect(() => {
		if (gameId && result.data?.id !== gameId) {
			dispatchMethod({ id: gameId });
		}
	}, [dispatchMethod, gameId, result.data?.id]);

	return {
		// `useServiceLayer` yields `null` before the first call; consumers expect `undefined`.
		game: result.data ?? undefined,
		isLoading: result.isPending || result.doneAt == null,
	};
}
