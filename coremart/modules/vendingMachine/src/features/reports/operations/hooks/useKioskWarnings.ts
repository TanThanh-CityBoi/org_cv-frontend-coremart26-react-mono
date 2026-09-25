import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useCallback, useEffect } from 'react';

import { usePaginationWithTotal } from '../../../../common/hooks';
import { operationReportService } from '../operationReportService';
import { KioskWarning } from '../type';


type SearchResponse = { items: KioskWarning[], total: number };

export function useKioskWarnings() {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(
		operationReportService.getKioskWarnings,
	);

	const fetchList = useCallback((page: number, size: number) => {
		dispatchMethod({ page, size });
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0);
	const { page, pageSize } = pagination;

	useEffect(() => {
		fetchList(page - 1, pageSize);
	}, [fetchList, page, pageSize]);

	// Default to `[]`: the slice this replaced always exposed an array.
	const data = result.data?.items ?? [];
	const isLoading = (result.isPending || result.doneAt == null) && !data.length;

	return {
		data,
		status: result.isPending ? 'pending' : 'success',
		error: result.error,
		isLoading,
		pagination,
	};
}
