import { Card, Stack, Title } from '@mantine/core';
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	type ChartOptions,
	Legend,
	LinearScale,
	Tooltip,
	type TooltipItem,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import { fmtNumber, fmtShortNumber } from '@/common/helpers';
import { REPORT_PALETTE_BORDERS, REPORT_PALETTE_FILLS } from '@/components/reportChartTheme';

import type { InventorySourceRow } from './type';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CHART_MAX_BARS = 10;

type InventoryStockBarChartProps = {
	title: string;
	rows: InventorySourceRow[];
};

export function InventoryStockBarChart({ title, rows }: InventoryStockBarChartProps): React.ReactElement {
	const chartRows = useMemo(
		() => [...rows]
			.sort((a, b) => b.totalQty - a.totalQty)
			.slice(0, CHART_MAX_BARS),
		[rows],
	);

	const chartData = useMemo(
		() => ({
			labels: chartRows.map((r) => r.productName),
			datasets: [
				{
					label: 'qty',
					data: chartRows.map((r) => r.totalQty),
					backgroundColor: REPORT_PALETTE_FILLS.blue,
					borderColor: REPORT_PALETTE_BORDERS.blue,
					borderWidth: 1,
					borderRadius: 4,
					maxBarThickness: 16,
				},
			],
		}),
		[chartRows],
	);

	const options = useMemo(
		(): ChartOptions<'bar'> => ({
			indexAxis: 'y' as const,
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					callbacks: {
						label: (ctx: TooltipItem<'bar'>) => {
							const raw = ctx.raw;
							const v = typeof raw === 'number' ? raw : Number(raw);
							return fmtNumber(v) ?? '';
						},
					},
				},
			},
			scales: {
				x: {
					beginAtZero: true,
					grid: { color: 'rgba(148, 163, 184, 0.25)' },
					ticks: {
						callback: (v: string | number) => fmtShortNumber(Number(v)),
					},
				},
				y: {
					grid: { display: false },
					ticks: {
						font: { size: 11 },
					},
				},
			},
		}),
		[],
	);

	const chartHeight = Math.max(280, chartRows.length * 28);

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder>
			<Stack gap='md'>
				<Title order={5} fw={700} fz='md'>{title}</Title>
				<div style={{ height: chartHeight, position: 'relative' }}>
					<Bar data={chartData} options={options} />
				</div>
			</Stack>
		</Card>
	);
}
