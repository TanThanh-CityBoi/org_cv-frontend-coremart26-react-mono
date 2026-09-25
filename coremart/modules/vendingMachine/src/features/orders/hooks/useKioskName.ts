import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useEffect } from 'react';

import { kioskCrudService } from '../../kiosks/kioskService';

import type { Kiosk } from '../../kiosks/types';


export function useKioskName(kioskRef: string | undefined): string | undefined {
	const { dispatchMethod, result } = useServiceLayer<Kiosk>(kioskCrudService.getById);

	useEffect(() => {
		if (kioskRef) {
			dispatchMethod({ id: kioskRef });
		}
	}, [dispatchMethod, kioskRef]);

	if (!kioskRef) return undefined;
	// Guard on the id: the shared result may still hold a previously-fetched kiosk.
	if (result.data?.id === kioskRef) {
		return result.data.name;
	}
	return undefined;
}
