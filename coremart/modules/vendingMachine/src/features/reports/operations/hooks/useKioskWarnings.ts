import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback, useEffect } from 'react';

import { operationReportActions, selectKioskWarnings, VendingMachineDispatch } from '@/appState';
import { usePagination } from '@/common/hooks';
import { PagedReduxState } from '@/types';

import { KioskWarning } from '../type';


export function useKioskWarnings() {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const kioskWarnings: PagedReduxState<KioskWarning> = useMicroAppSelector(selectKioskWarnings);

	const fetchList = useCallback((page: number, size: number) => {
		dispatch(operationReportActions.fetchKioskWarnings({ page, size }));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectKioskWarnings);

	useEffect(() => {
		fetchList(pagination.page - 1, pagination.pageSize);
	}, []);

	const status = kioskWarnings.status;
	const data = kioskWarnings.items;
	const error = kioskWarnings.error;
	const isLoading = (status === 'pending' || status === 'idle') && !data;

	return {
		data,
		status,
		error,
		isLoading,
		pagination,
	};
}
