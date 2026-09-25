import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { paymentService } from '../paymentService';
import { PaymentMethod } from '../types';


type GetOneResponse = { item: PaymentMethod };


export function usePaymentDetail(paymentId: string | undefined) {
	const { dispatchMethod, result } = useServiceLayer<GetOneResponse>(paymentService.getById);

	React.useEffect(() => {
		if (paymentId) {
			dispatchMethod({ id: paymentId });
		}
	}, [dispatchMethod, paymentId]);

	return {
		payment: result.data?.item,
		isLoading: result.isPending,
	};
}
