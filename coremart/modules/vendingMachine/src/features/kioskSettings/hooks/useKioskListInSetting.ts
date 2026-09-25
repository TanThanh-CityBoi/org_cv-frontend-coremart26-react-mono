import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { usePaginationWithTotal } from '../../../common/hooks';
import { SearchGraph } from '../../../types';
import { SortDirection } from '../../../types/search-graph';
import { kioskCrudService } from '../../kiosks/kioskService';
import { Kiosk } from '../../kiosks/types';
// The enum, not the `'asc' | 'desc'` type alias the `@/types` barrel re-exports under the same name.


type SearchResponse = { items: Kiosk[], total: number };

/** Kept from the deleted `kioskSettingSlice.listKiosksInSetting` thunk. */
const KIOSK_LIST_IN_SETTING_FIELDS: Array<keyof Kiosk> = [
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
 * Lists kiosks for the setting detail page.
 *
 * Note this queries the **kiosk** resource, not the setting — it only lived on the setting
 * slice for convenience. It now goes through `kioskCrudService`.
 */
export function useKioskListInSetting({ graph }: { graph?: SearchGraph } = {}) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(kioskCrudService.search);

	const fetchList = React.useCallback((targetPage: number, pageSize: number, searchGraph?: SearchGraph) => {
		dispatchMethod({
			page: targetPage - 1,
			size: pageSize,
			fields: KIOSK_LIST_IN_SETTING_FIELDS,
			graph: { order: [['created_at', SortDirection.DESC]], ...(searchGraph ?? {}) },
		});
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
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
