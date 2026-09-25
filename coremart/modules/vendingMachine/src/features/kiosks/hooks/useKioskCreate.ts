import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskCrudService } from '../kioskService';
import { KioskMode, UIMode } from '../types';


type CreateResponse = { id: string };



export type KioskCreateFormData = {
	code: string,
	name: string,
	mode: KioskMode,
	uiMode: UIMode,
	locationAddress?: string | null,
	latitude?: string | null,
	longitude?: string | null,
	// ref
	modelRef: string | null,
	settingRef?: string | null,
	paymentRefs?: string[] | null,
	eventRefs?: string[] | null,
	themeRef?: string | null,
	gameRef?: string | null,
	shoppingScreenPlaylistRef?: string | null,
	waitingScreenPlaylistRef?: string | null,
};

export type KioskCreatePayload = KioskCreateFormData;


export function useKioskCreate() {
	const navigate = useNavigate();
	const location = useLocation();

	const { dispatchMethod, result } = useServiceLayer<CreateResponse>(kioskCrudService.create);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: KioskCreatePayload) => {
		dispatchMethod(data);
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'kiosk.messages.create_success',
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
