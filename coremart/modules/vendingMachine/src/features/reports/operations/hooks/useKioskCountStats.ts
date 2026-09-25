import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';

import { operationReportActions, selectKioskStats, VendingMachineDispatch } from '@/appState';
import { ReportTimeQuery } from '@/types';

import { KioskStats } from '../type';



type OperationFilters = {
	fromDate: string;
	toDate: string;
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
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const kioskCountStats: ReduxActionState<KioskStats> = useMicroAppSelector(selectKioskStats);
	const query = useMemo(() => operationStatsFiltersToBaseQuery(filters), [filters]);

	const refresh = useCallback(() => {
		if (!query) return;
		dispatch(operationReportActions.fetchKioskStats(query));
	}, [dispatch, query]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const status = kioskCountStats.status;
	const data = kioskCountStats.data ;
	const error = kioskCountStats.error;
	const isLoading = (status === 'pending' || status === 'idle') && !data;

	return {
		data,
		status,
		error,
		isLoading,
		refresh,
	};
}