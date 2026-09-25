
import { Box, Card, Group, Radio, Stack, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
} from 'chart.js';
import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, fmtShortNumber } from '../../../../common/helpers/formartNumber';
import {
	TimeRangeSelect,
	type TimeRangePreset,
	type TimeRangePresetRange,
} from '../../../../components/RangePicker';
import { RevenueReportByHour } from '../type';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface RevenueByHourProps {
	data: RevenueReportByHour[];
	title?: string;
	showFilter?: boolean;
	activePreset?: TimeRangePreset;
	defaultPreset?: TimeRangePreset;
	onFilterChange?: (preset: TimeRangePreset, range: TimeRangePresetRange) => void;
}

function useChartOptions(activeTab: 'revenue' | 'orders') {
	const { t: translate } = useTranslation('vending_machine');

	const revenueAxisLabel = translate('reports.revenue_report.chart.revenue_axis_label');
	const ordersAxisLabel = translate('reports.revenue_report.chart.orders_axis_label');

	const options = useMemo(() => ({
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: 'top' as const,
				labels: {
					usePointStyle: true,
					padding: 15,
				},
			},
			tooltip: {
				callbacks: {
					label: (context: { parsed: { y: number | null } }) => {
						const value = context.parsed.y ?? 0;
						const formatted = fmtCurrency(value ?? 0);
						if (activeTab === 'revenue') {
							return translate('reports.revenue_report.chart.tooltip_revenue_value', {
								value: formatted,
							});
						}
						return translate('reports.revenue_report.chart.tooltip_orders_value', {
							value: formatted,
						});
					},
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: activeTab === 'revenue' ? revenueAxisLabel : ordersAxisLabel,
				},
				ticks: {
					callback: (value: number | string) => {
						return fmtShortNumber(value);
					},
				},
				grid: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			},
			x: {
				grid: {
					display: false,
				},
			},
		},
	}), [activeTab, translate]);
	return options;
}

function useChartData(data: RevenueReportByHour[], activeTab: 'revenue' | 'orders') {
	const { t: translate } = useTranslation('vending_machine');

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const hourlyDataMap = new Map(data.map((d) => [d.hour, d]));

	const revenueLabel = translate('reports.revenue_report.chart.radio_revenue');
	const ordersLabel = translate('reports.revenue_report.chart.radio_orders');

	const revenueData = hours.map((hour) => Number(hourlyDataMap.get(hour)?.totalRevenue || 0));
	const ordersData = hours.map((hour) => Number(hourlyDataMap.get(hour)?.orderCount || 0));

	const chartData = useMemo(() => ({
		labels: hours.map((h) => `${h.toString().padStart(2, '0')}h`),
		datasets: [
			{
				label: activeTab === 'revenue' ? revenueLabel : ordersLabel,
				data: activeTab === 'revenue' ? revenueData : ordersData,
				backgroundColor: 'rgba(59, 130, 246, 0.8)',
				borderColor: 'rgba(59, 130, 246, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 25,
			},
		],
	}), [activeTab, ordersData, ordersLabel, revenueData, revenueLabel]);

	return chartData;
};



export function RevenueByHourChart({
	data, title,
	showFilter = false, activePreset, defaultPreset = 'this_month', onFilterChange,
}: RevenueByHourProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');
	const [activeTab, setActiveTab] = useState<'revenue' | 'orders'>('revenue');

	const chartOptions = useChartOptions(activeTab);
	const chartData = useChartData(data, activeTab);

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Group justify='space-between' align='center'>
					<Title order={4} fw={600}>
						{title ?? translate('reports.revenue_report.chart.by_hour')}
					</Title>
					<Group gap='md' align='center'>
						<Radio.Group value={activeTab} onChange={(value) => setActiveTab(value as 'revenue' | 'orders')}>
							<Group gap='md'>
								<Radio value='revenue' label={
									translate('reports.revenue_report.chart.radio_revenue')
								} size='xs' />
								<Radio value='orders' label={
									translate('reports.revenue_report.chart.radio_orders')
								} size='xs' />
							</Group>
						</Radio.Group>
						{showFilter && (
							<TimeRangeSelect
								value={activePreset}
								defaultValue={defaultPreset}
								onChange={onFilterChange}
							/>
						)}
					</Group>
				</Group>
				<Box h={350} pos='relative'>
					<Bar data={chartData} options={chartOptions} />
				</Box>
			</Stack>
		</Card>
	);
}
