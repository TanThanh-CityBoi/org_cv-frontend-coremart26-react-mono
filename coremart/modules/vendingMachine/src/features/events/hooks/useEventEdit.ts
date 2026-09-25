import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback } from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { eventCrudService } from '../eventService';

import type { EventUpdateFormData, EventUpdatePatch } from '../types';


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


export function useEventEdit({ onUpdateSuccess }: { onUpdateSuccess?: () => void }) {
	const { dispatchMethod, result } = useServiceLayer(eventCrudService.update);

	useMutationOutcome(result, {
		successKey: () => 'events.messages.update_success',
		errorKey: 'errors.updateFailed',
		onSuccess: onUpdateSuccess,
	});

	const submit = useCallback(
		(body: EventUpdateFormData) => {
			const { id, etag, ...updates } = body;
			dispatchMethod({ id, etag, ...convertEventUpdateFormToApiPatch(updates) });
		},
		[dispatchMethod],
	);

	return { isSubmitting: result.isPending, handleSubmit: submit };
}
