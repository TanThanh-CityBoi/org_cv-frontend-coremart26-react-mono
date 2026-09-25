import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { themeCrudService } from '../themeService';

import type { Theme } from '../types';


export function useThemeDetail(themeId?: string) {
	const { dispatchMethod, result } = useServiceLayer<Theme>(themeCrudService.getById);

	React.useEffect(() => {
		if (themeId) {
			dispatchMethod({ id: themeId });
		}
	}, [themeId, dispatchMethod]);

	return {
		// `useServiceLayer` yields `null` before the first call; consumers expect `undefined`.
		theme: result.data ?? undefined,
		isLoading: result.isPending || result.doneAt == null,
	};
}
