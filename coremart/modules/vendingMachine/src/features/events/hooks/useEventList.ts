import { snakeToCamelObject } from '@nikkierp/common/utils';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { eventCrudService } from '../eventService';

import type { SearchGraph } from '../../../types';
import type { Event } from '../types';


type SearchResponse = { items: Event[], total: number };


export function useEventList({ graph }: { graph?: SearchGraph } = {}) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(eventCrudService.search);

	const fetchList = React.useCallback((targetPage: number, pageSizeArg: number, searchGraph?: SearchGraph) => {
		dispatchMethod({ page: targetPage - 1, size: pageSizeArg, graph: searchGraph });
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const events = React.useMemo(
		() => result.data?.items.map((item) => snakeToCamelObject(item) as Event),
		[result.data?.items],
	);
	const isLoading = !events?.length && result.isPending;
	const isEmpty = !events?.length && !result.isPending && result.doneAt != null;

	return {
		events,
		status: result.isPending ? 'pending' : 'success',
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}
