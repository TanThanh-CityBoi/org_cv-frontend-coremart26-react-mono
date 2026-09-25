import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { paymentService } from '../paymentService';

import type { PaymentMethod } from '../types';


export type PaymentCreateFormData = Pick<PaymentMethod, 'name' | 'method'> & Partial<
	Pick<PaymentMethod, 'image' | 'config' | 'isArchived'>
>;

type CreateResponse = { id: string };


export function usePaymentCreate() {
	const navigate = useNavigate();
	const location = useLocation();

	const { dispatchMethod, result } = useServiceLayer<CreateResponse>(paymentService.create);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: PaymentCreateFormData) => {
		dispatchMethod({
			name: data.name,
			method: data.method,
			isArchived: data.isArchived ?? false,
			...(data.image !== undefined && { image: data.image }),
			...(data.config !== undefined && { config: data.config }),
		});
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'payment.messages.create_success',
		errorKey: 'errors.createFailed',
		onSuccess: () => {
			const createdId = result.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		},
	});

	return { isSubmitting: result.isPending, handleSubmit, handleCancel };
}
