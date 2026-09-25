import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { kioskCrudService } from '../kioskService';

import type { Kiosk } from '../types';


export function useKioskDetail(kioskId?: string) {
	const { dispatchMethod, result } = useServiceLayer<Kiosk>(kioskCrudService.getById);

	React.useEffect(() => {
		if (kioskId) {
			dispatchMethod({ id: kioskId });
		}
	}, [kioskId, dispatchMethod]);

	return {
		// `useServiceLayer` yields `null` before the first call; consumers expect `undefined`.
		kiosk: result.data ?? undefined,
		isLoading: result.isPending || result.doneAt == null,
	};
}
