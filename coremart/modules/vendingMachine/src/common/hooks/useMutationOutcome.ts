import { useUIState } from '@nikkierp/shell/contexts';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ServiceLayerResult } from '@nikkierp/ui/appState/store';


type Outcome = {
	/** Shown on success. Resolved lazily so the caller can pick a key per call. */
	successKey: () => string,
	/** i18n interpolation values for `successKey`, resolved at the same moment. */
	successParams?: () => Record<string, unknown>,
	errorKey: string,
	/** Notification heading. Defaults to the generic `messages.success`. */
	successTitleKey?: string,
	/** Notification heading. Defaults to the generic `messages.error`. */
	errorTitleKey?: string,
	onSuccess?: () => void,
	onError?: () => void,
};


/**
 * Fires exactly once per completed call of a `useServiceLayer` mutation.
 *
 * `doneAt` changes once per completed call, so it — not `isSuccess` — is what marks a
 * result as unhandled. This replaces the `requestId` correlation the Redux slices used.
 *
 * Note `isSuccess`, not `isFulfilled`: a call returning client errors still *completed*,
 * so it is fulfilled but not successful.
 */
export function useMutationOutcome(result: ServiceLayerResult<unknown>, outcome: Outcome): void {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	// The service slice is a module-scope singleton keyed by method name, so `doneAt` outlives
	// any one mount. Baseline it on first render, otherwise remounting this hook replays the
	// notification for a call that completed earlier in the session.
	const handledAtRef = React.useRef<number | null | undefined>(undefined);
	if (handledAtRef.current === undefined) handledAtRef.current = result.doneAt ?? null;
	const outcomeRef = React.useRef(outcome);
	outcomeRef.current = outcome;

	React.useEffect(() => {
		if (result.doneAt == null || result.doneAt === handledAtRef.current) return;
		handledAtRef.current = result.doneAt;
		const current = outcomeRef.current;

		if (result.isSuccess) {
			const message = translate(current.successKey(), current.successParams?.());
			notification.showInfo(message, translate(current.successTitleKey ?? 'messages.success'));
			current.onSuccess?.();
			return;
		}

		const message = result.clientErrors[0]?.message ?? result.error;
		notification.showError(
			message ?? translate(current.errorKey),
			translate(current.errorTitleKey ?? 'messages.error'),
		);
		current.onError?.();
	}, [result, notification, translate]);
}
