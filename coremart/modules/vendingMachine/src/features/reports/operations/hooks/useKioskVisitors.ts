import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';

import { operationReportActions, selectKioskVisitors, VendingMachineDispatch } from '@/appState';
import { usePagination } from '@/common/hooks';
import { GroupTime, PagedReduxState } from '@/types';

import { KioskVisitor, KioskVisitorQuery } from '../type';


const BUCKET_FILL_LIMIT = 30;

export type KioskVisitorFilters = {
	fromDate: string;
	toDate: string;
	bucketType: GroupTime;
	kioskIds?: string[];
};

const defaultFilters: KioskVisitorFilters = {
	fromDate: dayjs().subtract(29, 'day').startOf('day').toISOString(),
	toDate: dayjs().endOf('day').toISOString(),
	bucketType: 'day',
};


function bucketKey(isoString: string, bucketType: GroupTime): string {
	const d = new Date(isoString);
	switch (bucketType) {
		case 'hour': return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}T${d.getUTCHours()}`;
		case 'day': return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
		case 'month': return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
		default: return `${d.getUTCFullYear()}`;
	}
}

function bucketStart(isoString: string, bucketType: GroupTime): Date {
	const d = new Date(isoString);
	switch (bucketType) {
		case 'hour':
			return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours()));
		case 'day':
			return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
		case 'month':
			return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
		default:
			return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	}
}

function nextBucket(date: Date, bucketType: GroupTime): Date {
	const d = new Date(date);
	switch (bucketType) {
		case 'hour': d.setUTCHours(d.getUTCHours() + 1); break;
		case 'day': d.setUTCDate(d.getUTCDate() + 1); break;
		case 'month': d.setUTCMonth(d.getUTCMonth() + 1); break;
		default: d.setUTCFullYear(d.getUTCFullYear() + 1);
	}
	return d;
}

/**
 * Fills missing time buckets within [fromDate, toDate) so the chart has
 * a continuous axis. Missing buckets get visitorCount = 0. Capped at BUCKET_FILL_LIMIT.
 */
export function fillMissingBuckets(
	visitors: KioskVisitor[],
	fromDate: string,
	toDate: string,
	bucketType: GroupTime,
	limit = BUCKET_FILL_LIMIT,
): KioskVisitor[] {
	const tenantId = visitors[0]?.tenantId ?? '';
	const visitorMap = new Map<string, KioskVisitor>(
		visitors.map(v => [bucketKey(v.bucketTime, bucketType), v]),
	);

	const end = new Date(toDate);
	let current = bucketStart(fromDate, bucketType);
	const result: KioskVisitor[] = [];

	while (current < end && result.length < limit) {
		const key = bucketKey(current.toISOString(), bucketType);
		result.push(visitorMap.get(key) ?? {
			bucketTime: current.toISOString(),
			bucketType,
			tenantId,
			visitorCount: 0,
		});
		current = nextBucket(current, bucketType);
	}

	return result;
}


export function useKioskVisitors(filters: KioskVisitorFilters = defaultFilters) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const kioskVisitors: PagedReduxState<KioskVisitor> = useMicroAppSelector(selectKioskVisitors);

	const baseQuery = useMemo<Omit<KioskVisitorQuery, 'page' | 'size'>>(() => ({
		fromDate: filters.fromDate,
		toDate: filters.toDate,
		bucketType: filters.bucketType,
		kioskIds: filters.kioskIds,
	}), [filters.fromDate, filters.toDate, filters.bucketType, filters.kioskIds]);

	const fetchList = useCallback((page: number, size: number) => {
		dispatch(operationReportActions.fetchKioskVisitors({ ...baseQuery, page, size }));
	}, [dispatch, baseQuery]);

	const pagination = usePagination(fetchList, selectKioskVisitors, { fallbackPageSize: 30 });

	useEffect(() => {
		fetchList(pagination.page - 1, pagination.pageSize);
	}, [baseQuery]);

	const status = kioskVisitors.status;
	const rawItems = kioskVisitors.items;
	const error = kioskVisitors.error;
	const isLoading = (status === 'pending' || status === 'idle') && !rawItems?.length;

	const data = useMemo(
		() => fillMissingBuckets(rawItems ?? [], filters.fromDate, filters.toDate, filters.bucketType),
		[rawItems, filters.fromDate, filters.toDate, filters.bucketType],
	);

	return {
		data,
		status,
		error,
		isLoading,
		pagination,
		filters,
	};
}
