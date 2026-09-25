import { Group, MultiSelect, Select, TextInput } from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import { IconClock, IconSearch, IconX } from '@tabler/icons-react';
import { debounce } from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterOffButton } from '../FilterOffButton';
import { RangePicker } from '../RangePicker';

import type {
	ControlPanelDateRangeFilter,
	ControlPanelFilterConfig,
	ControlPanelOptionFilter,
	ControlPanelSearchableMultiSelectFilter,
	ControlPanelSearchableSelectFilter,
	ControlPanelSearchFilter,
	ControlPanelTimeSlotFilter,
} from './types';


export interface ControlPanelFilterProps extends React.ComponentProps<typeof Group> {
	filters?: ControlPanelFilterConfig[];

	/** Whether to show the clear all filters button
	 * @default true
	 */
	clearable?: boolean;

	/** @deprecated Use a filter with type='search' in filters[] instead */
	search?: {
		value?: string,
		onChange?: (value: string) => void,
		placeholder?: string,
	};
}

const SEARCH_DEBOUNCE_MS = 300;

function isSearchFilter(filter: ControlPanelFilterConfig): filter is ControlPanelSearchFilter {
	return filter.type === 'search';
}

type DebouncedSearchTextInputProps = {
	value: string,
	onChange: (value: string) => void,
	placeholder?: string,
	minWidth?: number,
	clearable?: boolean,
};

const DebouncedSearchTextInput: React.FC<DebouncedSearchTextInputProps> = ({
	value,
	onChange,
	placeholder,
	minWidth = 250,
	clearable = true,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const [localValue, setLocalValue] = React.useState(value);
	const onChangeRef = React.useRef(onChange);
	onChangeRef.current = onChange;

	const debouncedNotify = React.useMemo(
		() => debounce((v: string) => onChangeRef.current(v), SEARCH_DEBOUNCE_MS),
		[],
	);

	React.useEffect(() => () => debouncedNotify.cancel(), [debouncedNotify]);

	React.useEffect(() => {
		debouncedNotify.cancel();
		setLocalValue(value);
	}, [value, debouncedNotify]);

	return (
		<TextInput
			placeholder={placeholder || translate('search.placeholder')}
			leftSection={<IconSearch size={16} />}
			value={localValue}
			onChange={(e) => {
				const next = e.currentTarget.value;
				setLocalValue(next);
				debouncedNotify(next);
			}}
			style={{ minWidth }}
			rightSection={clearable && localValue ? <IconX size={16} onClick={() => onChange('')} /> : <></>}
			fz='sm' fw={500} size='sm'
		/>
	);
};

const SearchFilterItem: React.FC<{ filter: ControlPanelSearchFilter }> = ({ filter }) => (
	<DebouncedSearchTextInput
		value={filter.value}
		onChange={filter.onChange}
		placeholder={filter.placeholder}
		minWidth={filter.minWidth || 250}
		clearable={filter.clearable !== false}
	/>
);

const SelectFilterItem: React.FC<{ filter: ControlPanelOptionFilter }> = ({ filter }) => {
	const { t: translate } = useTranslation('vending_machine');
	return (
		<Select
			placeholder={filter.placeholder || translate('search.filterStatus')}
			data={filter.options}
			value={filter.value[0] ?? null}
			onChange={(val) => filter.onChange(val ? [val] : [])}
			style={{ minWidth: filter.minWidth || 150 }}
			clearable={filter.clearable !== false}
			miw={filter.minWidth || 250}
			fz='sm' fw={500} size='sm'
		/>
	);
};

const MultiSelectFilterItem: React.FC<{ filter: ControlPanelOptionFilter }> = ({ filter }) => {
	const { t: translate } = useTranslation('vending_machine');
	return (
		<MultiSelect
			placeholder={filter.placeholder || translate('search.filterStatus')}
			data={filter.options}
			value={filter.value}
			onChange={(value) => filter.onChange(value)}
			style={{ minWidth: filter.minWidth || 150 }}
			maxValues={filter.maxValues ?? 5}
			clearable={filter.clearable !== false}
			miw={filter.minWidth || 250}
			fz='sm' fw={500} size='sm'
		/>
	);
};

const DateRangeFilterItem: React.FC<{ filter: ControlPanelDateRangeFilter }> = ({ filter }) => {
	return (
		<RangePicker
			value={filter.value}
			onChange={filter.onChange}
			valueFormat='DD/MM/YYYY'
			clearable={filter.clearable !== false}
			placeholder={filter.placeholder}
			miw={250}
		/>
	);
};

const TimeSlotFilterItem: React.FC<{ filter: ControlPanelTimeSlotFilter }> = ({ filter }) => {
	const patch = (partial: Partial<{ from: string | null, to: string | null }>) => {
		filter.onChange({
			from: partial.from !== undefined ? partial.from : filter.value.from,
			to: partial.to !== undefined ? partial.to : filter.value.to,
		});
	};

	const toStored = (raw: string) => (raw.trim() === '' ? null : raw);

	return (
		<Group gap={6} wrap='nowrap' align='flex-end'>
			<TimePicker
				value={filter.value.from ?? ''}
				onChange={(value) => patch({ from: toStored(value) })}
				leftSection={<IconClock size={16} stroke={1.6} />}
				size='sm'
				fz='sm'
				fw={500}
				style={{ minWidth: 115 }}
				withDropdown
				clearable
			/>
			<TimePicker
				value={filter.value.to ?? ''}
				onChange={(value) => patch({ to: toStored(value) })}
				leftSection={<IconClock size={16} stroke={1.6} />}
				size='sm'
				fz='sm'
				fw={500}
				style={{ minWidth: 115 }}
				withDropdown
				clearable
			/>
		</Group>
	);
};

const SearchableSelectFilterItem: React.FC<{ filter: ControlPanelSearchableSelectFilter }> = ({ filter }) => (
	<Select
		searchable
		searchValue={filter.searchValue}
		onSearchChange={filter.onSearchChange}
		data={filter.options}
		value={filter.value}
		onChange={filter.onChange}
		clearable={filter.clearable !== false}
		placeholder={filter.placeholder}
		miw={filter.minWidth ?? 220}
		fz='sm'
		fw={500}
		size='sm'
		comboboxProps={{ withinPortal: true }}
	/>
);

const SearchableMultiSelectFilterItem: React.FC<{ filter: ControlPanelSearchableMultiSelectFilter }> = ({ filter }) => (
	<MultiSelect
		searchable
		searchValue={filter.searchValue}
		onSearchChange={filter.onSearchChange}
		data={filter.options}
		value={filter.value}
		onChange={filter.onChange}
		clearable={filter.clearable !== false}
		placeholder={filter.placeholder}
		miw={filter.minWidth ?? 220}
		maxValues={filter.maxValues ?? 50}
		fz='sm'
		fw={500}
		size='sm'
		comboboxProps={{ withinPortal: true }}
	/>
);

const filterComponentMap: Record<string, React.FC<{ filter: any }>> = {
	search: SearchFilterItem,
	select: SelectFilterItem,
	multiSelect: MultiSelectFilterItem,
	dateRange: DateRangeFilterItem,
	timeSlot: TimeSlotFilterItem,
	searchableSelect: SearchableSelectFilterItem,
	searchableMultiSelect: SearchableMultiSelectFilterItem,
};

function hasActiveValues(filters: ControlPanelFilterConfig[]): boolean {
	return filters.some((f) => {
		if (f.includeInActiveSummary === false) {
			return false;
		}
		if (isSearchFilter(f)) return f.value?.trim() !== '';
		if (f.type === 'dateRange') return f.value && f.value[0] && f.value[1];
		if (f.type === 'timeSlot') {
			return Boolean(f.value?.from && f.value?.to);
		}
		if (f.type === 'searchableSelect') {
			return f.value != null && f.value !== '';
		}
		if (f.type === 'searchableMultiSelect') {
			return (f.value?.length ?? 0) > 0;
		}
		return f.value?.length > 0;
	});
}

function clearAllFilters(
	filters: ControlPanelFilterConfig[],
	legacySearch?: ControlPanelFilterProps['search'],
) {
	legacySearch?.onChange?.('');
	for (const f of filters) {
		if (f.clearWithClearAll === false) {
			continue;
		}
		if (isSearchFilter(f)) f.onChange('');
		else if (f.type === 'dateRange') f.onChange(undefined);
		else if (f.type === 'timeSlot') f.onChange({ from: null, to: null });
		else if (f.type === 'searchableSelect') {
			f.onChange(null);
			f.onSearchChange('');
		}
		else if (f.type === 'searchableMultiSelect') {
			f.onChange([]);
			f.onSearchChange('');
		}
		else f.onChange([]);
	}
}

export const ControlPanelFilter: React.FC<ControlPanelFilterProps> = ({
	filters = [],
	clearable = true,
	search,
	...restProps
}) => {
	const hasActive = useMemo(() => clearable && hasActiveValues(filters), [filters, clearable]);

	return (
		<Group gap='md' wrap='nowrap' align='flex-end' {...restProps}>
			{hasActive && (
				<FilterOffButton onClick={() => clearAllFilters(filters, search)} />
			)}

			{search && (
				<DebouncedSearchTextInput
					value={search.value ?? ''}
					onChange={(v) => search.onChange?.(v)}
					placeholder={search.placeholder}
				/>
			)}

			{filters.map((filter, index) => {
				const Component = filterComponentMap[filter.type ?? 'multiSelect'];
				if (!Component) return null;
				return <Component key={filter.key ?? index} filter={filter} />;
			})}
		</Group>
	);
};
