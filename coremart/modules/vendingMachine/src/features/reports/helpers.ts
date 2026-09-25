import dayjs from 'dayjs';
import { TFunction } from 'i18next';

import { formatTimeQuery, getDate } from '@/common/helpers/format-time';

import type { RevenueReportFilters } from '@/features/reports/business/components/RevenueReportSwitcher/type';
import type { BaseReportQuery, GroupTime, ListReportQuery, PageQuery, RevenueReportByOrderTimeQuery, SortDirection, SortQuery } from '@/types';
import type { DatesRangeValue, DateValue } from '@mantine/dates';


function dateValueToMs(value: DateValue | null | undefined): number | '' {
	if (value == null || value === '') return '';
	return dayjs(value).valueOf();
}

export function appliedFiltersStableKey(applied: RevenueReportFilters): string {
	const [start, end] = applied.dateRange ?? [];
	const kioskPart = [...applied.kioskIds].sort().join(',');
	return [
		dateValueToMs(start),
		dateValueToMs(end),
		kioskPart,
		applied.timeSlot.from ?? '',
		applied.timeSlot.to ?? '',
	].join('|');
}

export function revenueFiltersToBaseQuery(filters: RevenueReportFilters): BaseReportQuery | null {
	const [start, end] = filters.dateRange ?? [];
	if (!start || !end) return null;
	const fromDate = dayjs(start).startOf('day').toISOString();
	const toDate = dayjs(end).endOf('day').toISOString();
	const timeOfDateFrom = formatTimeQuery(filters.timeSlot.from, '00:00:00');
	const timeOfDateTo = formatTimeQuery(filters.timeSlot.to, '23:59:59');
	const base = { fromDate, toDate, timeOfDateFrom, timeOfDateTo };

	const ids = filters.kioskIds.filter(Boolean);
	if (ids.length) return { ...base, kioskIds: ids };
	return base;
}

type ListConvertParams = {
	filters: RevenueReportFilters;
	pageQuery?: PageQuery;
	sortBy?: SortBy | null;
	download?: boolean;
};
export function revenueReportListQuery({
	filters,
	pageQuery,
	download,
	sortBy,
}: ListConvertParams): ListReportQuery | null {
	const base = revenueFiltersToBaseQuery(filters);
	if (!base) return null;

	let sort: SortQuery['sort'] | undefined;
	if (sortBy && Object.keys(sortBy).length > 0) {
		sort = Object.entries(sortBy).map(([field, direction]) => ({ field, direction }));
	}

	const page = pageQuery?.page ?? 1;
	const size = pageQuery?.size ?? 5;

	return {
		...base,
		page: (page - 1),
		size,
		download,
		sort,
	};
}

type SortBy = {
	[key: string]: SortDirection;
};

type OrderTimeConvertParams = {
	filters: RevenueReportFilters;
	pageQuery?: PageQuery;
	download?: boolean;
	groupTime?: GroupTime;
	sortBy?: SortBy | null;
};
export function revenueReportByOrderTimeQuery({
	filters,
	pageQuery,
	groupTime: passedGroupTime,
	download,
	sortBy,
}: OrderTimeConvertParams,
): RevenueReportByOrderTimeQuery | null {
	const list = revenueReportListQuery({ filters, pageQuery, download, sortBy });
	if (!list) return null;
	const groupTime = passedGroupTime ?? timeRangeToGroupTime(filters.dateRange);
	return {
		...list,
		groupTime,
	};
}

export function formatOrderTimeLabel(
	orderTime: string,
	groupTime: GroupTime,
	i18nLanguage: string,
	translate: TFunction,
): string {
	const date = getDate(orderTime);
	if (!date) return orderTime;

	const groupTimeFormat: Record<GroupTime, string> = {
		day: 'DD-MM-YYYY',
		month: 'MM-YYYY',
		year: 'YYYY',
	};

	return translate('coremart.vendingMachine.reports.revenueReport.rowDateLabel', {
		shortDate: dayjs(date).locale(i18nLanguage).format(groupTimeFormat[groupTime] ?? 'DD-MM-YYYY'),
	});
}


export function timeRangeToGroupTime(timeRange: DatesRangeValue<DateValue> | undefined): GroupTime {
	if (!timeRange || !timeRange[0] || !timeRange[1]) return 'day';

	const diff = dayjs(timeRange[1]).diff(dayjs(timeRange[0]), 'day');
	if (diff <= 60) return 'day';
	if (diff <= 730) return 'month';
	return 'year';
}