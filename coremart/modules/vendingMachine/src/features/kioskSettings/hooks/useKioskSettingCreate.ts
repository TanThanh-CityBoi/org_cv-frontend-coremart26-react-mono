import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { kioskSettingCrudService } from '../kioskSettingService';

import type { KioskSettingCreatePayload } from './kioskSettingPayloads';


export interface KioskSettingCreateFormData {
	code: string;
	name: string;
	description?: string;
}

type CreateResponse = { id: string };

function buildKioskSettingCreatePayload(data: KioskSettingCreateFormData): KioskSettingCreatePayload {
	return {
		code: data.code,
		name: data.name,
		description: data.description,
		config: { volume: 70, brightness: 80, language: 'vi', auto_start: true },
	};
}


export function useKioskSettingCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const { t: translate } = useTranslation('vending_machine');

	const { dispatchMethod, result } = useServiceLayer<CreateResponse>(kioskSettingCrudService.create);
	const submittedNameRef = React.useRef('');

	const handleCancel = useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location.pathname]);

	const handleSubmit = useCallback((data: unknown) => {
		const form = data as KioskSettingCreateFormData;
		submittedNameRef.current = form.name ?? '';
		dispatchMethod(buildKioskSettingCreatePayload(form));
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'kiosk_settings.messages.create_success',
		successParams: () => ({
			name: submittedNameRef.current || translate('kiosk_settings.title'),
		}),
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
