import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskModelCrudService } from '../kioskModelService';

import type { KioskModel } from '../types';


export type KioskModelUpdateFormData = { id: string, etag: string } & Pick<
	Partial<KioskModel>,
	| 'referenceCode'
	| 'name'
	| 'description'
	| 'shelvesNumber'
	| 'shelvesConfig'
	| 'goodsCollectorType'
>;

export type KioskModelUpdatePayload = { id: string, body: KioskModelUpdateFormData };


export function useKioskModelEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const { dispatchMethod, result } = useServiceLayer(kioskModelCrudService.update);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_models.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: onUpdateSuccess,
	});

	const submit = useCallback((modelData: KioskModelUpdateFormData) => {
		if (!modelData.id) return;
		dispatchMethod(modelData);
	}, [dispatchMethod]);

	return { isSubmitting: result.isPending, handleSubmit: submit };
}
