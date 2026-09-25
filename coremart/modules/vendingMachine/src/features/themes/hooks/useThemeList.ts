import { snakeToCamelObject } from '@nikkierp/common/utils';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { themeCrudService } from '../themeService';

import type { Theme } from '../types';


type SearchResponse = { items: Theme[], total: number };

export function useThemeList() {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(themeCrudService.search);

	const handleRefresh = React.useCallback(() => dispatchMethod({}), [dispatchMethod]);

	React.useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	const themes = React.useMemo(
		() => (result.data?.items ?? []).map((item) => snakeToCamelObject(item) as Theme),
		[result.data?.items],
	);

	return {
		themes,
		isLoadingList: result.isPending || result.doneAt == null,
		handleRefresh,
	};
}
