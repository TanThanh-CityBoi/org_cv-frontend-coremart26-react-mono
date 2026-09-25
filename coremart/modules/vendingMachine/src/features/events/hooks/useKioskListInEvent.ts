import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { SortDirection } from '../../../types/search-graph';
import { kioskCrudService } from '../../kiosks/kioskService';
import { Kiosk } from '../../kiosks/types';
// The enum, not the `'asc' | 'desc'` type alias the `@/types` barrel re-exports under the same name.


type SearchResponse = { items: Kiosk[], total: number };

/** Kept from the deleted `eventSlice.listKiosksInEvent` thunk. */
const EVENT_KIOSK_LIST_DEFAULT_SIZE = 10;
const EVENT_KIOSK_LIST_FIELDS: Array<keyof Kiosk> = [
	'id',
	'etag',
	'code',
	'name',
	'isArchived',
	'mode',
	'uiMode',
	'locationAddress',
	'latitude',
	'longitude',
	'createdAt',
	'updatedAt',
];


/**
 * Lists kiosks for the event detail page.
 *
 * Like `useKioskListInSetting`, this queries the **kiosk** resource — `eventId` only resets
 * pagination when the page switches events; it is not a path segment or a filter here. That
 * matches the deleted thunk, which called `kioskService.searchKiosks` with no event predicate.
 */
export function useKioskListInEvent(
	{ eventId, graph }: { eventId: string, graph?: SearchGraph },
) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(kioskCrudService.search);

	const fetchList = React.useCallback(
		(targetPage: number, pageSize: number, searchGraph?: SearchGraph) => {
			dispatchMethod({
				fields: EVENT_KIOSK_LIST_FIELDS,
				page: targetPage - 1,
				size: pageSize,
				graph: { order: [['created_at', SortDirection.DESC]], ...(searchGraph ?? {}) },
			});
		},
		[dispatchMethod],
	);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
		graph,
		resetPageKey: eventId,
		fallbackPageSize: EVENT_KIOSK_LIST_DEFAULT_SIZE,
	});
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const kiosks = result.data?.items;
	const isLoading = !kiosks?.length && result.isPending;
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
