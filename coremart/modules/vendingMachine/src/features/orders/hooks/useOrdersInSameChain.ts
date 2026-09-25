import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { selectChainGroupOrderList, VendingMachineDispatch, vendingOrderActions } from '@/appState';
import { PagedReduxState } from '@/types';

import { CHAIN_GROUP_LIST_PAGE_SIZE } from '../orderSlice';

import type { VdOrder } from '../types';


/** Load orders sharing the same `chainKey` (search API) for the order detail “same chain” section. */
export function useOrdersInSameChain(chainKey?: string | null): {
	orders: VdOrder[];
	isLoading: boolean;
	error: string | null;
} {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const chainGroup = useMicroAppSelector(selectChainGroupOrderList) as PagedReduxState<VdOrder>;
	const trimmedKey = chainKey?.trim() ?? '';

	React.useEffect(() => {
		if (!trimmedKey) {
			dispatch(vendingOrderActions.clearChainGroupOrders());
			return;
		}

		dispatch(
			vendingOrderActions.listOrdersByChainKey({
				chainKey: trimmedKey,
				page: 0,
				size: CHAIN_GROUP_LIST_PAGE_SIZE,
			}),
		);

		return () => {
			dispatch(vendingOrderActions.clearChainGroupOrders());
		};
	}, [trimmedKey, dispatch]);

	const orders = chainGroup.items ?? [];
	const status = chainGroup.status;
	const isLoading =
		Boolean(trimmedKey)
		&& status !== 'success'
		&& status !== 'error';

	return {
		orders,
		isLoading,
		error: chainGroup.error,
	};
}
