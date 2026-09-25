import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect, useRef } from 'react';

import { kioskActions, selectKioskPositionsUpdate, VendingMachineDispatch } from '@/appState';
import { updateKioskPositions } from '@/features/kiosks/kioskSlice';

import type { KioskPositionUpdateItem } from '../kioskService';


export type UseKioskPositionEditParams = {
	kioskId: string;
	onUpdateSuccess?: () => void;
	onUpdateFailure?: () => void;
};

export function useKioskPositionEdit({ kioskId, onUpdateSuccess, onUpdateFailure }: UseKioskPositionEditParams) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { status: updateStatus, requestId } = useMicroAppSelector(selectKioskPositionsUpdate);
	const reduxRequestIdRef = useRef<string | null>(null);

	const handleSubmitPositions = useCallback(
		(positions: KioskPositionUpdateItem[]) => {
			if (positions.length === 0) {
				notifications.show({ title: 'Error', message: 'No Position to Update', color: 'red' });
				return;
			}
			const pendingAction = dispatch(updateKioskPositions({ kioskId, positions }));
			reduxRequestIdRef.current = pendingAction.requestId;
		},
		[kioskId, dispatch],
	);

	useEffect(() => {
		const matchesDispatch = requestId != null && reduxRequestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (updateStatus === 'success') {
			dispatch(kioskActions.resetKioskPositionsUpdate());
			reduxRequestIdRef.current = null;
			onUpdateSuccess?.();
			return;
		}

		if (updateStatus === 'error') {
			dispatch(kioskActions.resetKioskPositionsUpdate());
			reduxRequestIdRef.current = null;
			onUpdateFailure?.();
		}
	}, [updateStatus, onUpdateFailure, onUpdateSuccess, reduxRequestIdRef, requestId]);

	return {
		handleSubmitPositions,
		isSubmitting: updateStatus === 'pending',
	};
}
