/* eslint-disable max-lines-per-function */
import { Card, Stack, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, fmtShortNumber, getLocalizedName } from '@/common/helpers';

import type { RevenueReportByCategory } from '@/features/reports/business/type';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ProductCategoryBarChartProps = {
	data: readonly CategoryRevenueRow[];
	/** Highest-ranked categories shown (extra rows are ignored). Default 15. */
	maxCategories?: number;
	title?: string;
};


export type CategoryRevenueRow = {
	categoryLabel: string;
	revenue: number;
};

export function mapCategoryRowsToBarChart(
	rows: RevenueReportByCategory[],
	language: string,
): CategoryRevenueRow[] {
	return rows.map((row) => ({
		categoryLabel: getLocalizedName(row.categoryName, language) || row.categoryId,
		revenue: Number(row.totalRevenue) || 0,
	}));
}


export function ProductCategoryBarChart({
	data,
	maxCategories = 15,
	title,
}: ProductCategoryBarChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const chartRows = useMemo(() => {
		return [...data]
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, maxCategories);
	}, [data, maxCategories]);

	const revenueAxisShort = translate('coremart.vendingMachine.reports.revenueReport.chart.revenueAxisShort');
	const revenueAxisLabel = translate('coremart.vendingMachine.reports.revenueReport.chart.revenueAxisLabel');

	const chartData = useMemo(() => ({
		labels: chartRows.map((d) =>
			d.categoryLabel.length > 36 ? `${d.categoryLabel.slice(0, 33)}…` : d.categoryLabel,
		),
		datasets: [
			{
				label: revenueAxisShort,
				data: chartRows.map((d) => d.revenue),
				backgroundColor: 'rgba(16, 185, 129, 0.75)',
				borderColor: 'rgba(16, 185, 129, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 16,
			},
		],
	}), [chartRows, revenueAxisShort]);

	const chartOptions = useMemo(() => ({
		indexAxis: 'y' as const,
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					title: (items: { dataIndex: number }[]) => {
						const i = items[0]?.dataIndex;
						return i !== undefined ? chartRows[i].categoryLabel : '';
					},
					label: (context: { parsed?: { x?: number | null } }) => {
						const value = context.parsed?.x ?? 0;
						return `${revenueAxisShort}: ${fmtCurrency(value)}`;
					},
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text: revenueAxisLabel,
				},
				ticks: {
					callback: (value: number | string) => {
						return fmtShortNumber(value);
					},
				},
				grid: {
					color: 'rgba(0, 0, 0, 0.06)',
				},
			},
			y: {
				grid: {
					display: false,
				},
			},
		},
	}), [chartRows, revenueAxisShort, revenueAxisLabel]);

	const chartHeight = Math.max(320, chartRows.length * 36);

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				{title ? (
					<Title order={4} fw={600}>
						{title}
					</Title>
				) : null}
				<div style={{ height: chartHeight, position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
