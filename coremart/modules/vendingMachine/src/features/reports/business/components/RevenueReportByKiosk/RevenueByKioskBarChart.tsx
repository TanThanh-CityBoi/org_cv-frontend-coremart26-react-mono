/* eslint-disable max-lines-per-function */
import { Card, Group, Radio, Stack, Title, Text, Flex } from '@mantine/core';
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

import { fmtCurrency, fmtNumber, fmtShortNumber } from '@/common/helpers/formartNumber';
import {
	TimeRangeSelect,
	type TimeRangePreset,
	type TimeRangePresetRange,
} from '@/components/RangePicker';

import { RevenueReportByKiosk } from '../../type';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


interface RevenueByKioskBarChartProps {
	data: RevenueReportByKiosk[];
	maxDisplay?: number;
	title?: string;
	description?: string;
	showFilter?: boolean;
	activePreset?: TimeRangePreset;
	defaultPreset?: TimeRangePreset;
	onFilterChange?: (preset: TimeRangePreset, range: TimeRangePresetRange) => void;
}

export function RevenueByKioskBarChart({
	data,
	maxDisplay = 10,
	title,
	description,
	showFilter = false,
	activePreset,
	defaultPreset = 'this_month',
	onFilterChange,
}: RevenueByKioskBarChartProps): React.ReactElement {
	const { t: translate } = useTranslation();
	const [activeTab, setActiveTab] = useState<string | null>('revenue');

	// Sort by revenue or orders descending based on active tab
	const sortedData = useMemo(() => {
		const sorted = [...data].sort((a, b) => {
			if (activeTab === 'revenue') {
				return Number(b.totalRevenue) - Number(a.totalRevenue);
			}
			return b.orderCount - a.orderCount;
		});
		const topItems = sorted.slice(0, maxDisplay);

		// If there are more items, group the rest as "Khác"
		if (sorted.length > maxDisplay) {
			const otherItems = sorted.slice(maxDisplay);
			const otherRevenue = otherItems.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
			const otherOrders = otherItems.reduce((sum, item) => sum + item.orderCount, 0);

			return [
				...topItems,
				{
					kioskId: 'other',
					kioskName: translate('coremart.vendingMachine.reports.revenueReport.chart.otherKiosks'),
					totalRevenue: otherRevenue,
					orderCount: otherOrders,
				},
			];
		}

		return topItems;
	}, [data, maxDisplay, activeTab]);

	// Truncate kiosk names if too long
	const truncateName = (name: string, maxLength: number = 20): string => {
		if (name.length <= maxLength) return name;
		return name.substring(0, maxLength - 3) + '...';
	};

	const revenueLabel = translate('coremart.vendingMachine.reports.revenueReport.chart.radioRevenue');
	const ordersLabel = translate('coremart.vendingMachine.reports.revenueReport.chart.radioOrders');
	const revenueAxisLabel = translate('coremart.vendingMachine.reports.revenueReport.chart.revenueAxisLabel');
	const ordersAxisLabel = translate('coremart.vendingMachine.reports.revenueReport.chart.ordersAxisLabel');

	const chartData = {
		labels: sortedData.map((d) => truncateName(d.kioskName)),
		datasets: [
			{
				label: activeTab === 'revenue' ? revenueLabel : ordersLabel,
				data: activeTab === 'revenue'
					? sortedData.map((d) => Number(d.totalRevenue))
					: sortedData.map((d) => d.orderCount),
				backgroundColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(14, 165, 233, 0.6)',
				borderColor: activeTab === 'revenue' ? 'rgba(59, 130, 246, 1)' : 'rgba(14, 165, 233, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 16,
			},
		],
	};

	const chartOptions = {
		indexAxis: 'y' as const,
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
					title: (context: any) => {
						// Show full kiosk name in tooltip
						const index = context[0].dataIndex;
						return sortedData[index].kioskName;
					},
					label: (context: any) => {
						const value = context.parsed?.x ?? 0;
						if (activeTab === 'revenue') {
							return translate('coremart.vendingMachine.reports.revenueReport.chart.tooltipRevenueValue', { value: fmtCurrency(value) });
						}
						return translate('coremart.vendingMachine.reports.revenueReport.chart.tooltipOrdersValue', { value: fmtNumber(value) });
					},
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text: activeTab === 'revenue' ? revenueAxisLabel : ordersAxisLabel,
				},
				ticks: {
					callback: (value: any) => {
						return fmtShortNumber(value);
					},
				},
				grid: {
					color: 'rgba(255, 255, 255, 0.1)',
				},
			},
			y: {
				grid: {
					display: false,
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Group justify='space-between' align='center'>
					<Stack gap={4}>
						{title && (
							<>
							<Title order={4} fw={600}>
								{title}
							</Title>
							<Text size='xs' c='dimmed'>
								{description ?? ''}
							</Text>
						</>
						)}
					</Stack>
					<Group gap='md' align='center'>
						<Radio.Group value={activeTab} onChange={setActiveTab}>
							<Group gap='md'>
								<Radio value='revenue' label={revenueLabel} size='xs' />
								<Radio value='orders' label={ordersLabel} size='xs' />
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
				<Flex justify='flex-end'></Flex>
				<div style={{ height: '350px', position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
