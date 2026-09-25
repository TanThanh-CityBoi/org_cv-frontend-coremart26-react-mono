import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { gameCrudService } from '../gameService';

import type { Game } from '../types';


type SearchResponse = { items: Game[], total: number };

export function useGameList() {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(gameCrudService.search);

	const handleRefresh = React.useCallback(() => dispatchMethod({}), [dispatchMethod]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return {
		games: result.data?.items ?? [],
		isLoadingList: result.isPending || result.doneAt == null,
		handleRefresh,
	};
}
