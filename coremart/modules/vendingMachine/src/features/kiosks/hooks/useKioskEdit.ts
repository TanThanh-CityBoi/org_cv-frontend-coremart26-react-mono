import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskCrudService } from '../kioskService';

import type { Kiosk } from '../types';




export type KioskUpdateFormData = {id: string, etag: string} & Pick<
	Partial<Kiosk>,
	| 'code'
	| 'name'
	| 'displayName'
	| 'isArchived'
	| 'mode'
	| 'uiMode'
	| 'locationAddress'
	| 'latitude'
	| 'longitude'
	| 'modelRef'
	| 'settingRef'
	| 'paymentRefs'
	| 'eventRefs'
	| 'themeRef'
	| 'gameRef'
	| 'shoppingScreenPlaylistRef'
	| 'waitingScreenPlaylistRef'
	| 'goodsCollectorType'
	| 'shelvesNumber'
	| 'shelvesConfig'
>;

export type KioskUpdatePayload = { id: string, body: KioskUpdateFormData };

export function useKioskEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const { dispatchMethod, result } = useServiceLayer(kioskCrudService.update);

	const submit = useCallback(
		(body: KioskUpdateFormData) => {
			if (body.id) {
				dispatchMethod(body);
			}
		},
		[dispatchMethod],
	);

	useMutationOutcome(result, {
		successKey: () => 'kiosk.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: () => onUpdateSuccess?.(),
	});

	return { isSubmitting: result.isPending, handleSubmit: submit };
}
