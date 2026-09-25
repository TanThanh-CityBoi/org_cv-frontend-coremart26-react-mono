import { notifications } from '@mantine/notifications';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React, { useCallback } from 'react';

import { kioskStockService } from '../kioskStockService';

import type { KioskPositionUpdateItem } from '../types';


export type UseKioskPositionEditParams = {
	kioskId: string,
	onUpdateSuccess?: () => void,
	onUpdateFailure?: () => void,
};

export function useKioskPositionEdit({ kioskId, onUpdateSuccess, onUpdateFailure }: UseKioskPositionEditParams) {
	const { dispatchMethod, result } = useServiceLayer(kioskStockService.upsertPositions);

	const handleSubmitPositions = useCallback(
		(positions: KioskPositionUpdateItem[]) => {
			if (positions.length === 0) {
				notifications.show({ title: 'Error', message: 'No Position to Update', color: 'red' });
				return;
			}
			dispatchMethod({ kioskId, positions });
		},
		[kioskId, dispatchMethod],
	);

	// Not `useMutationOutcome`: this hook shows no notification of its own, matching the slice
	// version it replaces — the caller decides what to say.
	const doneAt = result.doneAt;
	const handledAtRef = React.useRef<number | null>(null);
	React.useEffect(() => {
		if (doneAt == null || doneAt === handledAtRef.current) return;
		handledAtRef.current = doneAt;
		if (result.isSuccess) {
			onUpdateSuccess?.();
			return;
		}
		onUpdateFailure?.();
	}, [doneAt, result.isSuccess, onUpdateSuccess, onUpdateFailure]);

	return {
		handleSubmitPositions,
		isSubmitting: result.isPending,
	};
}
