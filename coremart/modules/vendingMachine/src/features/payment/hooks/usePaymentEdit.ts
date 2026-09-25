import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { paymentService } from '../paymentService';

import type { PaymentMethod } from '../types';


export type PaymentUpdateFormData = { id: string, etag: string } & Pick<
	Partial<PaymentMethod>,
	'name' | 'method' | 'image' | 'config'
>;


export function usePaymentEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const { dispatchMethod, result } = useServiceLayer(paymentService.update);

	useMutationOutcome(result, {
		successKey: () => 'payment.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: onUpdateSuccess,
	});

	const submit = useCallback((modelData: PaymentUpdateFormData) => {
		if (!modelData.id || !modelData.etag) return;
		const { id, etag, name, method, image, config } = modelData;
		dispatchMethod({ id, etag, name, method, image, config });
	}, [dispatchMethod]);

	return { isSubmitting: result.isPending, handleSubmit: submit };
}
