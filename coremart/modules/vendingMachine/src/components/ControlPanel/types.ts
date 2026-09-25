import { DateValue } from '@mantine/dates';
import { DatesRangeValue } from '@mantine/dates';

import { SimpleFilter } from '../../common/helpers';
import { SearchNode } from '../../types';


export const VIEW_MODE_SEGMENTS = {
	list: 'list',
	grid: 'grid',
	kanban: 'kanban',
	gantt: 'gantt',
	calendar: 'calendar',
	map: 'map',
} as const;

export type ViewMode = (typeof VIEW_MODE_SEGMENTS)[keyof typeof VIEW_MODE_SEGMENTS];

export type ControlPanelBaseFilter = {
	key: string,
	type: string,
	value: any,
	onChange: (value: any) => void,
	getGraphValue?: (value: any) => SimpleFilter['value'],
	getCondition?: () => SearchNode[] | null,
	/** @default true — if false, filter is ignored when deciding whether any filters are active (e.g. report type). */
	includeInActiveSummary?: boolean,
	/** @default true — if false, “clear all” does not reset this filter. */
	clearWithClearAll?: boolean,
	//
	placeholder?: string,
	minWidth?: number,
	disabled?: boolean,
};

export interface ControlPanelSearchFilter extends ControlPanelBaseFilter {
	type: 'search';
	searchFields: string[];
	clearable?: boolean;
}

export interface ControlPanelOptionFilter extends ControlPanelBaseFilter {
	type: 'select' | 'multiSelect';
	options: Array<{ value: string, label: string }>;
	maxValues?: number;
	clearable?: boolean;
}

export interface ControlPanelDateRangeFilter extends ControlPanelBaseFilter {
	type: 'dateRange';
	value: DatesRangeValue<DateValue> | undefined;
	onChange: (value: DatesRangeValue<DateValue> | undefined) => void;
	clearable?: boolean;
	placeholder?: string;
}

export type ControlPanelTimeSlotValue = {
	/** HH:mm from TimeInput */
	from: string | null,
	to: string | null,
};

export interface ControlPanelTimeSlotFilter extends Omit<ControlPanelBaseFilter, 'value'> {
	type: 'timeSlot';
	value: ControlPanelTimeSlotValue;
	onChange: (value: ControlPanelTimeSlotValue) => void;
	clearable?: boolean;
}

export interface ControlPanelSearchableSelectFilter extends Omit<ControlPanelBaseFilter, 'value' | 'onChange'> {
	type: 'searchableSelect';
	/** Selected option value, or null when cleared */
	value: string | null;
	onChange: (value: string | null) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	options: Array<{ value: string, label: string }>;
	clearable?: boolean;
}

export interface ControlPanelSearchableMultiSelectFilter extends Omit<ControlPanelBaseFilter, 'value' | 'onChange'> {
	type: 'searchableMultiSelect';
	value: string[];
	onChange: (value: string[]) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	options: Array<{ value: string, label: string }>;
	clearable?: boolean;
	/** @default 50 */
	maxValues?: number;
}

export type ControlPanelFilterConfig =
	| ControlPanelSearchFilter
	| ControlPanelOptionFilter
	| ControlPanelDateRangeFilter
	| ControlPanelTimeSlotFilter //* use for report filters only
	| ControlPanelSearchableSelectFilter //* use for report filters only
	| ControlPanelSearchableMultiSelectFilter;

