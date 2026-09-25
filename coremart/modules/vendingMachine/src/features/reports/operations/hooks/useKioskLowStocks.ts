import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect } from 'react';

import { operationReportActions, selectLowStockWarnings, VendingMachineDispatch } from '@/appState';
import { usePagination } from '@/common/hooks';
import { PagedReduxState } from '@/types';

import { LowStockWarning } from '../type';




export function useKioskLowStocks() {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const lowStockWarnings: PagedReduxState<LowStockWarning> = useMicroAppSelector(selectLowStockWarnings);

	const fetchList = useCallback((page: number, size: number) => {
		dispatch(operationReportActions.fetchLowStockWarnings({ page, size }));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectLowStockWarnings);

	useEffect(() => {
		fetchList(pagination.page - 1, pagination.pageSize);
	}, []);

	const status = lowStockWarnings.status;
	const data = lowStockWarnings.items;
	const error = lowStockWarnings.error;
	const isLoading = (status === 'pending' || status === 'idle') && !data;

	return {
		data,
		status,
		error,
		isLoading,
		pagination,
	};
}