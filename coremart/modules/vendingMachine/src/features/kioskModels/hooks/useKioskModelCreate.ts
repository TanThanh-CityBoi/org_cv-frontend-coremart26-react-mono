import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskModelCrudService } from '../kioskModelService';

import type { KioskModel } from '../types';


export type KioskModelCreateFormData = Pick<
	KioskModel,
	| 'name'
	| 'description'
	| 'referenceCode'
	| 'shelvesNumber'
	| 'goodsCollectorType'
>;

export type KioskModelCreatePayload = KioskModelCreateFormData;

type CreateResponse = { id: string };


export function useKioskModelCreate() {
	const navigate = useNavigate();
	const location = useLocation();

	const { dispatchMethod, result } = useServiceLayer<CreateResponse>(kioskModelCrudService.create);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskModelCreateFormData) => {
		dispatchMethod(data);
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_models.messages.create_success',
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
