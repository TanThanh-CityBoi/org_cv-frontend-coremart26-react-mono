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
	const { t: translate, i18n } = useTranslation();
	const today = dayjs().locale(i18n.language);

	const valueFormat = i18n.language === 'vi' ? 'D MMMM, YYYY' : 'MMMM D, YYYY';

	const presets: DatePickerPreset<'range'>[] = [
		{
			value: [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('coremart.vendingMachine.common.datePicker.today'),
		},
		{
			value: [today.subtract(2, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('coremart.vendingMachine.common.datePicker.lastTwoDays'),
		},
		{
			value: [today.subtract(7, 'day').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('coremart.vendingMachine.common.datePicker.lastSevenDays'),
		},
		{
			value: [today.startOf('week').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('coremart.vendingMachine.common.datePicker.thisWeek'),
		},
		{
			value: [today.startOf('month').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('coremart.vendingMachine.common.datePicker.thisMonth'),
		},
		{
			value: [
				today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
				today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
			],
			label: translate('coremart.vendingMachine.common.datePicker.lastMonth'),
		},
		{
			value: [
				today.subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
				today.subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
			],
			label: translate('coremart.vendingMachine.common.datePicker.lastYear'),
		},
		{
			value: [today.startOf('year').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
			label: translate('coremart.vendingMachine.common.datePicker.thisYear'),
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
