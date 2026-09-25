import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, selectVendingOrderDetail, vendingOrderActions } from '@/appState';

import { VdOrder } from '../types';


type UseOrderDetailProps = {
	id?: string;
	orderCode?: string;
};
export function useOrderDetail({ id, orderCode }: UseOrderDetailProps): {
	order: VdOrder | undefined; isLoading: boolean
} {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectVendingOrderDetail);

	React.useEffect(() => {
		if (id) {
			dispatch(vendingOrderActions.getOrder({ id }));
		}
		else if (orderCode) {
			dispatch(vendingOrderActions.getOrder({ orderCode }));
		}
	}, [id, orderCode, dispatch]);

	return {
		order: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
