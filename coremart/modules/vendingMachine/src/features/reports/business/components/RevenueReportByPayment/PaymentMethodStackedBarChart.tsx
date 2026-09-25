
import { Card, Group, Progress, Stack, Text, Title } from '@mantine/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { fmtCurrency } from '../../../../../common/helpers';
import { PaginationConfig } from '../../../../../common/hooks/usePagination';
import {
	TimeRangeSelect,
	type TimeRangePreset,
	type TimeRangePresetRange,
} from '../../../../../components/RangePicker';
import { RevenueReportByPaymentMethod } from '../../type';



interface ChartProps {
	items: RevenueReportByPaymentMethod[];
	pagination: PaginationConfig;
	isLoading: boolean;
	totalRevenue: number;
	showFilter?: boolean;
	activePreset?: TimeRangePreset;
	defaultPreset?: TimeRangePreset;
	onFilterChange?: (preset: TimeRangePreset, range: TimeRangePresetRange) => void;
}

// Color palette for payment methods
const PAYMENT_COLORS = [
	'rgba(59, 130, 246, 0.8)',   // blue
	'rgba(34, 197, 94, 0.8)',     // green
	'rgba(168, 85, 247, 0.8)',    // purple
	'rgba(251, 146, 60, 0.8)',   // orange
	'rgba(239, 68, 68, 0.8)',    // red
	'rgba(236, 72, 153, 0.8)',   // pink
	'rgba(14, 165, 233, 0.8)',   // sky blue
	'rgba(34, 197, 94, 0.8)',     // emerald
];

const MAX_DISPLAY = 5;

export function PaymentMethodStackedBarChart({
	items, totalRevenue,
	showFilter = false, activePreset, defaultPreset = 'this_month', onFilterChange,
}: ChartProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');
	const paymentMethodData = useMemo(() => {
		return items.slice(0, MAX_DISPLAY).map((item, index) => {
			return {
				...item,
				percentage: (Number(item.totalRevenue) / totalRevenue) * 100,
				color: PAYMENT_COLORS[index % PAYMENT_COLORS.length],
			};
		}, [items, totalRevenue]);
	}, [items, totalRevenue]);

	const segments = paymentMethodData.map((item) => ({
		value: item.percentage,
		color: item.color,
		label: item.name,
	}));

	const totalPercentage = segments.reduce((sum, segment) => sum + segment.value, 0);

	if (totalPercentage < 100) {
		segments.push({
			value: 100 - totalPercentage,
			color: 'rgba(156, 163, 175, 0.8)',
			label: 'Other',
		});
	}


	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='max-content' mih={300}>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							{translate('reports.revenue_by_payment_method.title')}
						</Title>
						<Text size='xs' c='dimmed'>
							{translate('reports.revenue_by_payment_method.stacked_bar_chart_description')}
						</Text>
					</Stack>
					{showFilter && (
						<TimeRangeSelect
							value={activePreset}
							defaultValue={defaultPreset}
							onChange={onFilterChange}
						/>
					)}
				</Group>
				<Stack gap='xs'>
					{paymentMethodData.map((item, pIndex) => (
						<Group key={pIndex} justify='space-between' align='center'>
							<Group gap='xs'>
								<div
									style={{
										width: '12px',
										height: '12px',
										backgroundColor: item.color,
										borderRadius: '2px',
									}}
								/>
								<Text size='sm'>{item.name}</Text>
							</Group>
							<Group gap='xs'>
								<Text size='sm' fw={500}>
									{fmtCurrency(Number(item.totalRevenue))}
								</Text>
								<Text size='sm' c='dimmed' fw={500}>
									({item.percentage.toFixed(2)}%)
								</Text>
							</Group>
						</Group>
					))}
				</Stack>
				<Progress.Root size='lg' radius='md'>
					{segments.map((segment, index) => (
						<Progress.Section
							key={index}
							value={segment?.value ?? 0}
							color={segment?.color ?? 'rgba(156, 163, 175, 0.8)'}
						/>
					))}
				</Progress.Root>
				{totalRevenue > 0 && (
					<Text size='xs' c='dimmed' ta='right'>
						{translate('reports.revenue_report.summary.total_revenue')}: {fmtCurrency(totalRevenue)}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
