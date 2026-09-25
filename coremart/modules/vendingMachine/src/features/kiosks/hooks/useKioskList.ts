import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { kioskCrudService } from '../kioskService';
import { Kiosk } from '../types';


type SearchResponse = { items: Kiosk[], total: number };

export function useKioskList({ graph }: { graph?: SearchGraph } = {}) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(kioskCrudService.search);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatchMethod({ page: targetPage - 1, size, graph: searchGraph });
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	// Default to `[]`: the slice this replaced always exposed an array.
	const kiosks = result.data?.items ?? [];
	const isLoading = !kiosks?.length && (result.isPending || result.doneAt == null);
	const isEmpty = !kiosks?.length && !result.isPending && result.doneAt != null;

	return {
		kiosks,
		status: result.isPending ? 'pending' : 'success',
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}
