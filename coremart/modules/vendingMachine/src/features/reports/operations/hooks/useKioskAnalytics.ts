import { useServiceLayer } from '@nikkierp/ui/appState/store';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';

import { usePaginationWithTotal } from '../../../../common/hooks';
import { GroupTime } from '../../../../types';
import { operationReportService } from '../operationReportService';
import { KioskAnalyticsQuery, KioskStateAnalytic } from '../type';


type SearchResponse = { items: KioskStateAnalytic[], total: number };


const BUCKET_FILL_LIMIT = 30;

export type KioskAnalyticsFilters = {
	fromDate: string,
	toDate: string,
	bucketType: GroupTime,
	kioskIds?: string[],
};

const defaultFilters: KioskAnalyticsFilters = {
	fromDate: dayjs().subtract(29, 'day').startOf('day').toISOString(),
	toDate: dayjs().endOf('day').toISOString(),
	bucketType: 'day',
};

const EMPTY_ANALYTIC: Omit<KioskStateAnalytic, 'bucketTime' | 'bucketType' | 'tenantId'> = {
	current: 0,
	energy: 0,
	energyDelta: 0,
	homeSwitch: '',
	humidity: 0,
	power: 0,
	temperature: 0,
	unidentifiedSwitch: '',
	voltage: 0,
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
 * Fills missing time buckets within [fromDate, toDate) with zero-value analytics.
 * Capped at BUCKET_FILL_LIMIT items.
 */
export function fillMissingAnalyticBuckets(
	items: KioskStateAnalytic[],
	fromDate: string,
	toDate: string,
	bucketType: GroupTime,
	limit = BUCKET_FILL_LIMIT,
): KioskStateAnalytic[] {
	const tenantId = items[0]?.tenantId ?? '';
	const itemMap = new Map<string, KioskStateAnalytic>(
		items.map(v => [bucketKey(v.bucketTime, bucketType), v]),
	);

	const end = new Date(toDate);
	let current = bucketStart(fromDate, bucketType);
	const result: KioskStateAnalytic[] = [];

	while (current < end && result.length < limit) {
		const key = bucketKey(current.toISOString(), bucketType);
		result.push(itemMap.get(key) ?? {
			...EMPTY_ANALYTIC,
			bucketTime: current.toISOString(),
			bucketType,
			tenantId,
		});
		current = nextBucket(current, bucketType);
	}

	return result;
}


export function useKioskAnalytics(filters: KioskAnalyticsFilters = defaultFilters) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(
		operationReportService.getKioskAnalytics,
	);

	const baseQuery = useMemo<Omit<KioskAnalyticsQuery, 'page' | 'size'>>(() => ({
		fromDate: filters.fromDate,
		toDate: filters.toDate,
		bucketType: filters.bucketType,
		kioskIds: filters.kioskIds,
	}), [filters.fromDate, filters.toDate, filters.bucketType, filters.kioskIds]);

	const fetchList = useCallback((page: number, size: number) => {
		dispatchMethod({ ...baseQuery, page, size });
	}, [dispatchMethod, baseQuery]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { fallbackPageSize: 30 });
	const { page, pageSize } = pagination;

	useEffect(() => {
		fetchList(page - 1, pageSize);
	}, [fetchList, page, pageSize]);

	const status = result.isPending ? 'pending' : 'success';
	const rawItems = result.data?.items;
	const error = result.error;
	const isLoading = (result.isPending || result.doneAt == null) && !rawItems?.length;

	const data = useMemo(
		() => fillMissingAnalyticBuckets(rawItems ?? [], filters.fromDate, filters.toDate, filters.bucketType),
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
