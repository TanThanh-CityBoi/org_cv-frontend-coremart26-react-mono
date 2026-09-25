import { buildSimpleSearchGraph, type SimpleFilter } from '@/common/helpers';
import { SearchGraph } from '@/types';

import type { ControlPanelFilterConfig } from './types';
import type { DateValue, DatesRangeValue } from '@mantine/dates';



export function dateValueToBoundaryDate(value: DateValue | null | undefined): Date | null {
	if (value == null || value === '') return null;
	if (value instanceof Date) return value;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function dateRangeToSimpleTuple(
	range: DatesRangeValue<DateValue> | undefined,
): [Date | null, Date | null] {
	if (!range) return [null, null];
	const [start, end] = range;
	const startDate = dateValueToBoundaryDate(start);
	const endDate = dateValueToBoundaryDate(end);

	return [
		startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null,
		endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null,
	];
}

/**
 * Maps {@link ControlPanelFilterConfig} rows to {@link SimpleFilter} for `buildSimpleSearchGraph`.
 *
 * Supported types: `search`, `select`, `multiSelect`, and `dateRange` (as `type: 'date'` with a date tuple).
 * Skips `timeSlot`, `searchableSelect`, etc.
 */
export function controlPanelToSimpleFilters(
	configs: ControlPanelFilterConfig[],
): SimpleFilter[] {
	const simple: SimpleFilter[] = [];

	for (const f of configs) {
		if(f.disabled) continue;

		switch (f.type) {
			case 'search':
				simple.push({
					key: f.key,
					type: 'search',
					searchFields: f.searchFields,
					value: typeof f.value === 'string' ? f.value : String(f.value ?? ''),
					...(f.getGraphValue ? { getGraphValue: f.getGraphValue } : {}),
					...(f.getCondition ? { getCondition: f.getCondition } : {}),
				});
				break;
			case 'select':
			case 'multiSelect':
				simple.push({
					key: f.key,
					type: f.type,
					value: f.value,
					...(f.getGraphValue ? { getGraphValue: f.getGraphValue } : {}),
					...(f.getCondition ? { getCondition: f.getCondition } : {}),
				});
				break;
			case 'dateRange':
				simple.push({
					key: f.key,
					type: 'date',
					value: dateRangeToSimpleTuple(f.value),
					...(f.getGraphValue ? { getGraphValue: f.getGraphValue } : {}),
					...(f.getCondition ? { getCondition: f.getCondition } : {}),
				});
				break;
			default:
				break;
		}
	}

	return simple;
}


/**
 *
 * @param configs - The control panel filter configurations.
 * @returns The search graph.
 */
export function controlPanelToSearchGraph(
	configs: ControlPanelFilterConfig[],
): SearchGraph {
	const simpleFilters = controlPanelToSimpleFilters(configs);
	return buildSimpleSearchGraph(simpleFilters);
}