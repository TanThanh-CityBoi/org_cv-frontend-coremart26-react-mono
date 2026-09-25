/* eslint-disable max-lines-per-function */
import {
	Divider,
	MultiSelect,
	ScrollArea,
	Stack,
	Switch,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { RangePicker } from '../RangePicker';

import type { ReportFilterMenuBarProps } from './types';


export type ReportFilterFieldsProps = Pick<
	ReportFilterMenuBarProps,
	| 'kioskOptions'
	| 'kioskValue'
	| 'onKioskChange'
	| 'dateRange'
	| 'onDateRangeChange'
	| 'reportSections'
	| 'sectionVisibility'
	| 'onSectionVisibilityChange'
> & {
	isNarrow: boolean;
	maxH: string;
};

export function ReportFilterFields({
	isNarrow,
	maxH,
	kioskOptions,
	kioskValue,
	onKioskChange,
	dateRange,
	onDateRangeChange,
	reportSections,
	sectionVisibility,
	onSectionVisibilityChange,
}: ReportFilterFieldsProps) {
	const { t: translate } = useTranslation();
	const theme = useMantineTheme();

	const switchStyles = {
		body: { justifyContent: 'space-between' as const, width: '100%' as const },
		label: {
			flex: 1,
			paddingRight: theme.spacing.sm,
			fontSize: theme.fontSizes.sm,
		},
	};

	return (
		<Stack gap='sm' style={{ maxHeight: maxH }}>
			<Title order={6} fz={{ base: 'sm', sm: 'md' }} fw={600}>
				{translate('coremart.vendingMachine.reports.filterBar.title')}
			</Title>

			<ScrollArea.Autosize mah={isNarrow ? 'calc(88vh - 120px)' : maxH} type='auto'>
				<Stack gap='md' pb='xs'>
					<Stack gap={6}>
						<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
							{translate('coremart.vendingMachine.reports.filterBar.dateRange')}
						</Text>
						<RangePicker
							value={dateRange}
							onChange={onDateRangeChange}
							placeholder={translate('coremart.vendingMachine.common.datePicker.selectDateRange')}
							clearable={false}
							miw={0}
							size='sm'
							w='100%'
							popoverProps={{ withinPortal: false }}
						/>
					</Stack>

					<Stack gap={6}>
						<Text size='xs' fw={600} c='dimmed' tt='uppercase'>
							{translate('coremart.vendingMachine.reports.filterBar.kiosk')}
						</Text>
						<MultiSelect
							data={kioskOptions}
							value={kioskValue}
							onChange={onKioskChange}
							placeholder={translate('coremart.vendingMachine.reports.filterBar.kioskPlaceholder')}
							size='sm'
							maxDropdownHeight={220}
							w='100%'
							miw={0}
							hidePickedOptions
							comboboxProps={{ withinPortal: false }}
						/>
					</Stack>

					{reportSections.length > 0 && (
						<>
							<Divider
								label={translate('coremart.vendingMachine.reports.filterBar.reportSections')}
								labelPosition='left'
							/>
							<Stack gap='xs'>
								{reportSections.map((s) => (
									<Switch
										key={s.id}
										label={s.label}
										checked={sectionVisibility[s.id] !== false}
										onChange={(e) => onSectionVisibilityChange(s.id, e.currentTarget.checked)}
										size='sm'
										labelPosition='left'
										styles={switchStyles}
										aria-label={
											`${translate('coremart.vendingMachine.reports.filterBar.toggleSection')}: ${s.label}`
										}
									/>
								))}
							</Stack>
						</>
					)}
				</Stack>
			</ScrollArea.Autosize>
		</Stack>
	);
}
