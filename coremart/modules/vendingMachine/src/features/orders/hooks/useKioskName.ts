import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useEffect } from 'react';

import { VendingMachineDispatch, kioskActions, selectKioskDetail } from '@/appState';


export function useKioskName(kioskRef: string | undefined): string | undefined {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectKioskDetail);

	useEffect(() => {
		if (kioskRef) {
			dispatch(kioskActions.getKiosk(kioskRef));
		}
	}, [dispatch, kioskRef]);

	if (!kioskRef) return undefined;
	if (detail.data?.id === kioskRef) {
		return detail.data.name;
	}
	return undefined;
}
