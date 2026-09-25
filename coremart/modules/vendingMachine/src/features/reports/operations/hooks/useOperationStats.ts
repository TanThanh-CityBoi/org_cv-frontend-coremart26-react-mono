import { useServiceLayer } from '@nikkierp/ui/appState/store';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';

import { ReportTimeQuery } from '../../../../types';
import { operationReportService } from '../operationReportService';
import { OperationStats } from '../type';



type OperationStatsFilters = {
	fromDate: string,
	toDate: string,
};


const defaultFilters: OperationStatsFilters = {
	fromDate: dayjs().startOf('day').toISOString(),
	toDate: dayjs().endOf('day').toISOString(),
};

const operationStatsFiltersToBaseQuery = (filters: OperationStatsFilters): ReportTimeQuery => {
	return {
		fromDate: filters.fromDate,
		toDate: filters.toDate,
	};
};


export function useOperationStats( filters: OperationStatsFilters = defaultFilters ) {
	const { dispatchMethod, result } = useServiceLayer<OperationStats>(
		operationReportService.getOperationalStats,
	);
	const query = useMemo(() => operationStatsFiltersToBaseQuery(filters), [filters]);

	const refresh = useCallback(() => {
		dispatchMethod(query);
	}, [dispatchMethod, query]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const status = result.isPending ? 'pending' : 'success';
	const data = result.data ?? undefined;
	const error = result.error;
	const isLoading = (result.isPending || result.doneAt == null) && !data;

	return {
		data,
		status,
		error,
		isLoading,
		refresh,
	};
}