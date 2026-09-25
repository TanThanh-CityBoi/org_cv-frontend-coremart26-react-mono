import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { eventActions, selectUpdateEvent, VendingMachineDispatch } from '@/appState';

import type { EventUpdateFormData, EventUpdatePatch } from '@/features/events/types';


export type { EventUpdateFormData };

/** API expects `HH:mm` (e.g. `"08:00"`). */
export function toEventApiDailyTime(value: string): string {
	const trimmed = value.trim();
	const match = /^(\d{1,2}):(\d{2})(?::\d{2})?/.exec(trimmed);
	if (!match) return trimmed;
	return `${match[1].padStart(2, '0')}:${match[2]}`;
}

/** API expects RFC3339 UTC (e.g. `"2026-06-01T00:00:00Z"`). */
export function toEventApiDateTimeIso(value: Date | string): string {
	if (value instanceof Date) return value.toISOString();
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

/**
 * Maps form values (Date for date fields) to the wire shape for PATCH.
 * - `startTime` / `endTime` → ISO strings with `Z`
 * - `dailyStartTime` / `dailyEndTime` → `HH:mm`
 */
export function convertEventUpdateFormToApiPatch(
	raw: Omit<EventUpdateFormData, 'id' | 'etag'>,
): EventUpdatePatch {
	const patch = { ...raw } as EventUpdatePatch;
	if (raw.startTime != null && raw.startTime !== '') {
		patch.startTime = toEventApiDateTimeIso(raw.startTime as Date | string);
	}
	if (raw.endTime != null && raw.endTime !== '') {
		patch.endTime = toEventApiDateTimeIso(raw.endTime as Date | string);
	}
	if (raw.dailyStartTime != null && raw.dailyStartTime !== '') {
		patch.dailyStartTime = toEventApiDailyTime(raw.dailyStartTime);
	}
	if (raw.dailyEndTime != null && raw.dailyEndTime !== '') {
		patch.dailyEndTime = toEventApiDailyTime(raw.dailyEndTime);
	}
	return patch;
}

function useSubmitHandler(
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onUpdateSuccess?: () => void,
) {
	const updateEvt = useMicroAppSelector(selectUpdateEvent);
	const updateRequestIdRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		const requestId = updateEvt.requestId;
		const matchesDispatch = requestId != null && requestId === updateRequestIdRef.current;
		if (!matchesDispatch) return;

		if (updateEvt.status === 'success') {
			updateRequestIdRef.current = null;
			dispatch(eventActions.resetUpdateEvent());
			onUpdateSuccess?.();
			notification.showInfo(
				translate('coremart.vendingMachine.events.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
		}
		else if (updateEvt.status === 'error') {
			updateRequestIdRef.current = null;
			dispatch(eventActions.resetUpdateEvent());
			notification.showError(
				updateEvt.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
		}
	}, [updateEvt, dispatch, notification, translate, onUpdateSuccess]);

	const handleSubmit = useCallback((id: string, etag: string, updates: EventUpdatePatch) => {
		const action = dispatch(eventActions.updateEvent({ id, etag, updates }));
		updateRequestIdRef.current = action.requestId;
	}, [dispatch]);

	return {
		isSubmitting: updateEvt.status === 'pending',
		handleSubmit,
	};
}

export function useEventEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const { isSubmitting, handleSubmit } = useSubmitHandler(
		dispatch,
		notification,
		translate,
		onUpdateSuccess,
	);

	const submit = useCallback(
		(body: EventUpdateFormData) => {
			const { id, etag, ...updates } = body;
			handleSubmit(id, etag, convertEventUpdateFormToApiPatch(updates));
		},
		[handleSubmit],
	);

	return { isSubmitting, handleSubmit: submit };
}
