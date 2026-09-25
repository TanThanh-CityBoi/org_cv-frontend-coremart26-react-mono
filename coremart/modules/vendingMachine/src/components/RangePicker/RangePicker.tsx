import { Indicator } from '@mantine/core';
import { DatePickerInput, DatePickerInputProps, DatePickerPreset, DatesProvider } from '@mantine/dates';
import { IconCalendarEvent } from '@tabler/icons-react';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

import 'dayjs/locale/vi';
import 'dayjs/locale/en';


export type RangePickerProps = DatePickerInputProps<'range'>;

export const RangePicker: React.FC<RangePickerProps> = ({ value, onChange, ...rest }) => {
	const { t: translate, i18n } = useTranslation('vending_machine');
	const today = dayjs().locale(i18n.language);

	const valueFormat = i18n.language === 'vi' ? 'D MMMM, YYYY' : 'MMMM D, YYYY';

	const presets: DatePickerPreset<'range'>[] = [
		{
			value: [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('common.date_picker.today'),
		},
		{
			value: [today.subtract(2, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('common.date_picker.last_two_days'),
		},
		{
			value: [today.subtract(7, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('common.date_picker.last_seven_days'),
		},
		{
			value: [today.startOf('week').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('common.date_picker.this_week'),
		},
		{
			value: [today.startOf('month').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('common.date_picker.this_month'),
		},
		{
			value: [
				today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
				today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
			],
			label: translate('common.date_picker.last_month'),
		},
		{
			value: [
				today.subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
				today.subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
			],
			label: translate('common.date_picker.last_year'),
		},
		{
			value: [today.startOf('year').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('common.date_picker.this_year'),
		},
	];

	return (
		<DatesProvider settings={{ locale: i18n.language }}>
			<DatePickerInput
				allowSingleDateInRange type='range'
				leftSection={<IconCalendarEvent size={20} stroke={1.6} />}
				leftSectionPointerEvents='none'
				presets={presets} valueFormat={valueFormat}
				value={value} onChange={onChange}
				miw={200}
				{...rest}
			/>
		</DatesProvider>
	);
};


export const dayRenderer: DatePickerInputProps['renderDay'] = (date) => {
	const day = dayjs(date).date();
	return (
		<Indicator size={6} color='red' offset={-5} disabled={day !== 16}>
			<div>{day}</div>
		</Indicator>
	);
};
