import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';

import { operationReportActions, selectOperationalStats, VendingMachineDispatch } from '@/appState';
import { ReportTimeQuery } from '@/types';

import { OperationStats } from '../type';



type OperationStatsFilters = {
	fromDate: string;
	toDate: string;
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
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const operationalStats: ReduxActionState<OperationStats> = useMicroAppSelector(selectOperationalStats);
	const query = useMemo(() => operationStatsFiltersToBaseQuery(filters), [filters]);

	const refresh = useCallback(() => {
		if (!query) return;
		dispatch(operationReportActions.fetchOperationalStats(query));
	}, [dispatch, query]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const status = operationalStats.status;
	const data = operationalStats.data ;
	const error = operationalStats.error;
	const isLoading = (status === 'pending' || status === 'idle') && !data;

	return {
		data,
		status,
		error,
		isLoading,
		refresh,
	};
}