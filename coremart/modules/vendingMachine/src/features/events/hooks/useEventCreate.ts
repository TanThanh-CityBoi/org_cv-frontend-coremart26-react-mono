import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { eventCrudService } from '../eventService';
import { toEventApiDailyTime, toEventApiDateTimeIso } from './useEventEdit';

import type { EventCreateFormData } from '../types';


export type { EventCreateFormData };

type CreateResponse = { id: string };

export function convertEventCreateFormToApi(data: EventCreateFormData) {
	return {
		...data,
		startTime: toEventApiDateTimeIso(data.startTime),
		endTime: toEventApiDateTimeIso(data.endTime),
		dailyStartTime: toEventApiDailyTime(data.dailyStartTime),
		dailyEndTime: toEventApiDailyTime(data.dailyEndTime),
	};
}

export function useEventCreate() {
	const navigate = useNavigate();
	const location = useLocation();

	const { dispatchMethod, result } = useServiceLayer<CreateResponse>(eventCrudService.create);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: EventCreateFormData) => {
		dispatchMethod(convertEventCreateFormToApi(data));
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'events.messages.create_success',
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
