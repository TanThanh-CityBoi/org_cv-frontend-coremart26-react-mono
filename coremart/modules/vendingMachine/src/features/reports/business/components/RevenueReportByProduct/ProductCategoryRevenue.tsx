
import { Card, Group, Stack, Text, Title } from '@mantine/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, getLocalizedName } from '../../../../../common/helpers';
import { PaginationConfig } from '../../../../../common/hooks';
import {
	TimeRangeSelect,
	type TimeRangePreset,
	type TimeRangePresetPickerProps,
	type TimeRangePresetRange,
} from '../../../../../components/RangePicker';
import { REPORT_PALETTE_FILLS, reportPaletteKeyAt } from '../../../../../components/reportChartTheme';

import type { RevenueReportByCategory } from '../../type';


ChartJS.register(ArcElement, Tooltip, Legend);


interface ProductCategoryRevenueProps {
	items: RevenueReportByCategory[];
	pagination: PaginationConfig;
	isLoading: boolean;
	/** Show the preset filter select. Defaults to true. */
	showFilter?: boolean;
	/** Currently active preset (controlled). If omitted the picker is uncontrolled. */
	activePreset?: TimeRangePreset;
	/** Default preset shown when uncontrolled. Defaults to 'this_month'. */
	defaultPreset?: TimeRangePreset;
	/** Which presets to surface in the picker. */
	filterPresets?: TimeRangePresetPickerProps['presets'];
	/** Called whenever the user selects a new preset. */
	onFilterChange?: (preset: TimeRangePreset, range: TimeRangePresetRange) => void;
}

const MAX_DISPLAY_ITEMS = 5;

export function ProductCategoryRevenue({
	items,
	showFilter = false,
	activePreset,
	defaultPreset = 'this_month',
	filterPresets,
	onFilterChange,
}: ProductCategoryRevenueProps) {
	const { t: translate, i18n } = useTranslation('vending_machine');

	const processedItems = useMemo(() => {
		if (items.length <= MAX_DISPLAY_ITEMS) {
			return items;
		}
		const sortedItems = [...items].sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue));

		return sortedItems.slice(0, MAX_DISPLAY_ITEMS);
	}, [items]);


	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%' mih={250}>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							{translate('reports.revenue_report.chart.category_doughnut_title')}
						</Title>
						<Text size='xs' c='dimmed'>
							{translate('reports.revenue_report.chart.category_doughnut_description')}
						</Text>
					</Stack>
					{showFilter && (
						<TimeRangeSelect
							value={activePreset}
							defaultValue={defaultPreset}
							presets={filterPresets}
							onChange={onFilterChange}
						/>
					)}
				</Group>
				<Stack gap='xs'>
					{processedItems.map((item, index) => (
						<Group key={item.categoryId} justify='space-between' align='center'>
							<Group gap='xs'>
								<div
									style={{
										width: '4px',
										height: '20px',
										backgroundColor: REPORT_PALETTE_FILLS[reportPaletteKeyAt(index)],
										borderRadius: '2px',
									}}
								/>
								<Text size='sm' fw={500}>
									{getLocalizedName(item.categoryName, i18n.language)}
								</Text>
							</Group>
							<Group gap='md'>
								<Text size='sm' fw={500}>
									{fmtCurrency(Number(item.totalRevenue))}
								</Text>
							</Group>
						</Group>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
