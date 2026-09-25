import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { SearchOperator } from '../../../types/search-graph';
import { orderCrudService } from '../orderService';

import type { VdOrder } from '../types';


export const CHAIN_GROUP_LIST_PAGE_SIZE = 10;

type SearchResponse = { items: VdOrder[], total: number };

/** Load orders sharing the same `chainKey` (search API) for the order detail “same chain” section. */
export function useOrdersInSameChain(chainKey?: string | null): {
	orders: VdOrder[],
	isLoading: boolean,
	error: string | null,
} {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(orderCrudService.search);
	const trimmedKey = chainKey?.trim() ?? '';

	React.useEffect(() => {
		if (!trimmedKey) {
			return;
		}
		dispatchMethod({
			page: 0,
			size: CHAIN_GROUP_LIST_PAGE_SIZE,
			graph: { and: [{ if: ['chain_key', SearchOperator.EQUAL, trimmedKey] }] },
		});
	}, [trimmedKey, dispatchMethod]);

	// The slice's `clearChainGroupOrders` is gone: this hook owns its own service-layer result,
	// so there is no shared entry for a stale chain's rows to leak out of.
	const orders = trimmedKey ? result.data?.items ?? [] : [];
	const isLoading = Boolean(trimmedKey) && (result.isPending || result.doneAt == null);

	return {
		orders,
		isLoading,
		error: result.error,
	};
}
