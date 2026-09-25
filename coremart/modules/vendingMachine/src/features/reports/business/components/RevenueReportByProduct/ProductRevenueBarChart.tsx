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

import { fmtCurrency, fmtShortNumber } from '../../../../../common/helpers';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type ProductRevenueRow = {
	productLabel: string,
	revenue: number,
};

type ProductRevenueBarChartProps = {
	data: readonly ProductRevenueRow[],
	/** Highest-ranked products shown (extra rows are ignored). Default 15. */
	maxItems?: number,
	title?: string,
};

export function ProductRevenueBarChart({
	data,
	maxItems = 15,
	title,
}: ProductRevenueBarChartProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const chartRows = useMemo(() => {
		return [...data]
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, maxItems);
	}, [data, maxItems]);

	const tooltipRevenueAxis = translate('reports.revenue_report.chart.revenue_axis_short');
	const revenueAxisLabel = translate('reports.revenue_report.chart.revenue_axis_label');

	const chartData = useMemo(() => ({
		labels: chartRows.map((d) =>
			d.productLabel.length > 36 ? `${d.productLabel.slice(0, 33)}…` : d.productLabel,
		),
		datasets: [
			{
				label: tooltipRevenueAxis,
				data: chartRows.map((d) => d.revenue),
				backgroundColor: 'rgba(37, 99, 235, 0.75)',
				borderColor: 'rgba(37, 99, 235, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 16,
			},
		],
	}), [chartRows, tooltipRevenueAxis]);

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
						return i !== undefined ? chartRows[i].productLabel : '';
					},
					label: (context: any) => {
						const value = context.parsed?.x ?? 0;
						return `${tooltipRevenueAxis}: ${fmtCurrency(value)}`;
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
	}), [chartRows, tooltipRevenueAxis, revenueAxisLabel]);

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
