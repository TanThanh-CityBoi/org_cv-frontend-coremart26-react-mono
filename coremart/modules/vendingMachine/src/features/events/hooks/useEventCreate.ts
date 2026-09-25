import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { eventActions, selectCreateEvent, VendingMachineDispatch } from '@/appState';

import { toEventApiDateTimeIso } from './useEventEdit';
import { toEventApiDailyTime } from './useEventEdit';

import type { EventCreateFormData } from '@/features/events/types';


export type { EventCreateFormData };

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
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createEvt = useMicroAppSelector(selectCreateEvent);
	const createRequestIdRef = React.useRef<string | null>(null);

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: EventCreateFormData) => {
		const action = dispatch(eventActions.createEvent(convertEventCreateFormToApi(data)));
		createRequestIdRef.current = action.requestId;
	}, [dispatch]);

	const isSubmitting = createEvt.status === 'pending';

	React.useEffect(() => {
		const requestId = createEvt.requestId;
		const matchesDispatch = requestId != null && requestId === createRequestIdRef.current;
		if (!matchesDispatch) return;

		if (createEvt.status === 'success') {
			createRequestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.events.messages.create_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(eventActions.resetCreateEvent());
			dispatch(eventActions.listEvents());

			const createdId = createEvt.data?.id;
			if (createdId) {
				navigate(resolvePath(`../${createdId}`, location.pathname).pathname);
			}
		}

		if (createEvt.status === 'error') {
			createRequestIdRef.current = null;
			notification.showError(
				createEvt.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(eventActions.resetCreateEvent());
		}
	}, [createEvt, dispatch, notification, translate, navigate, location.pathname]);

	return { isSubmitting, handleSubmit, handleCancel };
}
