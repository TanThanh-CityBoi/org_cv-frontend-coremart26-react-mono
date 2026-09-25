/* eslint-disable max-lines-per-function */
import { Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, getLocalizedName } from '@/common/helpers';
import { REPORT_PALETTE_FILLS, reportPaletteKeyAt } from '@/components/reportChartTheme';

import type { RevenueReportByCategory } from '@/features/reports/business/type';



// Mock product category revenue data
// Testing with 6 items to demonstrate "Other" grouping (will show top 4 + "Other")
const _mockProductCategoryRevenue = {
	totalRevenue: '$125,000',
	items: [
		{ name: 'Nước suối', revenue: 35000, percentage: 28.0, change: 5.2, color: 'rgba(59, 130, 246, 0.8)' },
		{ name: 'Cà phê', revenue: 32000, percentage: 25.6, change: 8.1, color: 'rgba(139, 69, 19, 0.8)' },
		{ name: 'Nước có ga', revenue: 25000, percentage: 20.0, change: -2.3, color: 'rgba(34, 197, 94, 0.8)' },
		{ name: 'Đồ ăn', revenue: 18000, percentage: 14.4, change: 12.5, color: 'rgba(251, 146, 60, 0.8)' },
		{ name: 'Sữa', revenue: 10000, percentage: 8.0, change: 3.7, color: 'rgba(255, 255, 255, 0.8)' },
		{ name: 'Dừa', revenue: 5000, percentage: 4.0, change: -1.2, color: 'rgba(168, 85, 247, 0.8)' },
	],
};



ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductCategoryItem {
	name: string;
	revenue: number;
	percentage: number;
	change: number;
	color: string;
}


export function mapCategoryRowsToDoughnut(
	rows: RevenueReportByCategory[],
	language: string,
) {
	const totalNum = rows.reduce((sum, item) => sum + Number(item.totalRevenue), 0);
	const sorted = [...rows].sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue));

	return {
		totalRevenue: totalNum,
		items: sorted.map((c, i) => ({
			name: getLocalizedName(c.categoryName, language) || c.categoryId,
			revenue: Number(c.totalRevenue) || 0,
			percentage: totalNum > 0 ? ((Number(c.totalRevenue) || 0) / totalNum) * 100 : 0,
			change: 0,
			color: REPORT_PALETTE_FILLS[reportPaletteKeyAt(i)],
		})),
	};
}

interface ProductCategoryRevenueProps {
	totalRevenue: number;
	items: ProductCategoryItem[];
	timeRange?: 'lastMonth' | 'lastWeek' | 'lastYear';
}

const MAX_DISPLAY_ITEMS = 10;
const OTHER_CATEGORY_COLOR = 'rgba(156, 163, 175, 0.8)'; // gray

export function ProductCategoryDoughnutChart({
	totalRevenue,
	items,
	timeRange,
}: ProductCategoryRevenueProps) {
	const { t: translate } = useTranslation();
	// Group items if there are more than MAX_DISPLAY_ITEMS
	const processedItems = useMemo(() => {
		if (items.length <= MAX_DISPLAY_ITEMS) {
			return items;
		}

		// Sort by revenue descending
		const sortedItems = [...items].sort((a, b) => b.revenue - a.revenue);

		// Take top MAX_DISPLAY_ITEMS - 1 (to leave room for "Other")
		const topItems = sortedItems.slice(0, MAX_DISPLAY_ITEMS - 1);

		// Group remaining items into "Other"
		const otherItems = sortedItems.slice(MAX_DISPLAY_ITEMS - 1);
		const otherRevenue = otherItems.reduce((sum, item) => sum + item.revenue, 0);
		const otherPercentage = totalRevenue > 0 ? (otherRevenue / totalRevenue) * 100 : 0;

		// Calculate average change for "Other" category
		const otherChange = otherItems.length > 0
			? otherItems.reduce((sum, item) => sum + item.change, 0) / otherItems.length
			: 0;

		return [
			...topItems,
			{
				name: 'Khác',
				revenue: otherRevenue,
				percentage: otherPercentage,
				change: otherChange,
				color: OTHER_CATEGORY_COLOR,
			},
		];
	}, [items]);

	const data = {
		labels: processedItems.map((item) => item.name),
		datasets: [
			{
				data: processedItems.map((item) => item.revenue),
				backgroundColor: processedItems.map((item) => item.color),
				borderColor: processedItems.map((item) => item.color),
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: '70%',
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const label = context.label || '';
						const value = Number(context.parsed) || 0;
						const percentage = totalRevenue > 0 ? (value / Number(totalRevenue)) * 100 : 0;
						const revenueFormatted = fmtCurrency(value) ?? '0';
						return `${label}: ${revenueFormatted} (${percentage.toFixed(1)}%)`;
					},
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Title order={4} fw={600}>
							{translate('coremart.vendingMachine.reports.revenueReport.chart.categoryDoughnutTitle')}
						</Title>
						<Text size='xs' c='dimmed'>
							{translate('coremart.vendingMachine.reports.revenueReport.chart.categoryDoughnutDescription')}
						</Text>
					</Stack>
					{timeRange && <Group gap='xs'>
						<Select
							placeholder='Last month'
							data={['Last month', 'Last week', 'Last year']}
							defaultValue='Last month'
							size='xs'
							w={120}
						/>
					</Group>}
				</Group>
				<div style={{ height: '250px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Doughnut data={data} options={options} />
					<div style={{ position: 'absolute', textAlign: 'center' }}>
						<Text size='xs' c='dimmed'>{translate('coremart.vendingMachine.reports.revenueReport.chart.totalRevenue')}</Text>
						<Title order={3} fw={600}>{fmtCurrency(Number(totalRevenue ?? 0))}</Title>
					</div>
				</div>
				<Stack gap='xs'>
					{processedItems.map((item) => (
						<Group key={item.name} justify='space-between' align='center'>
							<Group gap='xs'>
								<div
									style={{
										width: '4px',
										height: '20px',
										backgroundColor: item.color,
										borderRadius: '2px',
									}}
								/>
								<Text size='sm' fw={500}>
									{item.name}
								</Text>
							</Group>
							<Group gap='md'>
								<Text size='sm' fw={500}>
									{item.percentage.toFixed(1)}%
								</Text>
								<Text size='sm' c={item.change >= 0 ? 'green' : 'red'}>
									{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
								</Text>
							</Group>
						</Group>
					))}
				</Stack>
			</Stack>
		</Card>
	);
}
