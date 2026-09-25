import { useCallback, useState } from 'react';

import { buildKioskMediaCreateFormData, kioskMediaService } from '../kioskMediaService';

import type { RestCreateResponse } from '@/types';


export function useKioskMediaCreate(): {
	isSubmitting: boolean;
	create: (params: { name: string; file: File }) => Promise<RestCreateResponse>;
} {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const create = useCallback(async (params: { name: string; file: File }) => {
		setIsSubmitting(true);
		try {
			const form = buildKioskMediaCreateFormData(params);
			return await kioskMediaService.createKioskMedia(form);
		}
		finally {
			setIsSubmitting(false);
		}
	}, []);

	return { isSubmitting, create };
}
