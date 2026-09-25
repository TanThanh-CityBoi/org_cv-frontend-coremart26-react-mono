import { Select, type MantineSize } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


export type TimeRangePreset =
	| 'today'
	| 'this_week'
	| 'this_month'
	| 'this_year'
	| 'last_week'
	| 'last_month'
	| 'last_year';

export type TimeRangePresetRange = [Date, Date];

const DATE_PICKER_I18N = 'common.date_picker';

export function presetToRange(preset: TimeRangePreset): TimeRangePresetRange {
	const today = dayjs();
	switch (preset) {
		case 'today':
			return [today.startOf('day').toDate(), today.endOf('day').toDate()];
		case 'this_week':
			return [today.startOf('week').toDate(), today.endOf('day').toDate()];
		case 'last_week':
			return [
				today.subtract(1, 'week').startOf('week').toDate(),
				today.subtract(1, 'week').endOf('week').toDate(),
			];
		case 'this_month':
			return [today.startOf('month').toDate(), today.endOf('day').toDate()];
		case 'last_month':
			return [
				today.subtract(1, 'month').startOf('month').toDate(),
				today.subtract(1, 'month').endOf('month').toDate(),
			];
		case 'this_year':
			return [today.startOf('year').toDate(), today.endOf('day').toDate()];
		case 'last_year':
			return [
				today.subtract(1, 'year').startOf('year').toDate(),
				today.subtract(1, 'year').endOf('year').toDate(),
			];
	}
}

export interface TimeRangePresetPickerProps {
	value?: TimeRangePreset;
	defaultValue?: TimeRangePreset;
	onChange?: (preset: TimeRangePreset, range: TimeRangePresetRange) => void;
	size?: MantineSize;
	w?: number | string;
	presets?: TimeRangePreset[];
}

const DEFAULT_PRESETS: TimeRangePreset[] = [
	'today',
	'this_week',
	'this_month',
	'this_year',
	'last_week',
	'last_month',
	'last_year',
];

const PRESET_I18N_KEY: Record<TimeRangePreset, string> = {
	today: 'today',
	this_week: 'thisWeek',
	this_month: 'thisMonth',
	this_year: 'thisYear',
	last_week: 'lastWeek',
	last_month: 'lastMonth',
	last_year: 'lastYear',
};

export function presetToGroupTime(preset: TimeRangePreset): 'hour' | 'day' | 'month' {
	switch (preset) {
		case 'this_year':
		case 'last_year':
			return 'month';
		default:
			return 'day';
	}
}

export const TimeRangeSelect: React.FC<TimeRangePresetPickerProps> = ({
	value,
	defaultValue = 'this_month',
	onChange,
	size = 'xs',
	w = 130,
	presets = DEFAULT_PRESETS,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const data = useMemo(
		() => presets.map((preset) => ({
			value: preset,
			label: translate(`${DATE_PICKER_I18N}.${PRESET_I18N_KEY[preset]}`),
		})),
		[presets, translate],
	);

	const handleChange = (val: string | null) => {
		if (!val) return;
		const preset = val as TimeRangePreset;
		onChange?.(preset, presetToRange(preset));
	};

	return (
		<Select
			value={value}
			defaultValue={defaultValue}
			data={data}
			onChange={handleChange}
			size={size}
			w={w}
			allowDeselect={false}
			checkIconPosition='right'
		/>
	);
};
