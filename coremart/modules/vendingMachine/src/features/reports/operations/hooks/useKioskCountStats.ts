import { useServiceLayer } from '@nikkierp/ui/appState/store';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';

import { ReportTimeQuery } from '../../../../types';
import { operationReportService } from '../operationReportService';
import { KioskStats } from '../type';



type OperationFilters = {
	fromDate: string,
	toDate: string,
};


const defaultFilters: OperationFilters = {
	fromDate: dayjs().startOf('day').toISOString(),
	toDate: dayjs().endOf('day').toISOString(),
};

const operationStatsFiltersToBaseQuery = (filters: OperationFilters): ReportTimeQuery => {
	return {
		fromDate: filters.fromDate,
		toDate: filters.toDate,
	};
};

export function useKioskCountStats( filters: OperationFilters = defaultFilters ) {
	const { dispatchMethod, result } = useServiceLayer<KioskStats>(operationReportService.getKioskStats);
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