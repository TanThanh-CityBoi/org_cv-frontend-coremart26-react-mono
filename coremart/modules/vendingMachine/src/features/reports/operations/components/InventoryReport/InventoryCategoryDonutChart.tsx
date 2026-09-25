import { Card, Stack, Title } from '@mantine/core';
import {
	ArcElement,
	Chart as ChartJS,
	Legend,
	Tooltip,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';

import {
	REPORT_PALETTE_BORDERS,
	REPORT_PALETTE_FILLS,
	reportPaletteKeyAt,
} from '@/components/reportChartTheme';


ChartJS.register(ArcElement, Tooltip, Legend);

export type InventoryCategorySlice = {
	key: string;
	label: string;
	qty: number;
};

type InventoryCategoryDonutChartProps = {
	title: string;
	slices: InventoryCategorySlice[];
};

export function InventoryCategoryDonutChart({ title, slices }: InventoryCategoryDonutChartProps): React.ReactElement {
	const data = useMemo(() => {
		const backgrounds = slices.map((_, i) => REPORT_PALETTE_FILLS[reportPaletteKeyAt(i)]);
		const borders = slices.map((_, i) => REPORT_PALETTE_BORDERS[reportPaletteKeyAt(i)]);
		return {
			labels: slices.map((s) => s.label),
			datasets: [
				{
					data: slices.map((s) => s.qty),
					backgroundColor: backgrounds,
					borderColor: borders,
					borderWidth: 1,
				},
			],
		};
	}, [slices]);

	const nf = new Intl.NumberFormat('vi-VN');

	const options = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			cutout: '58%',
			plugins: {
				legend: {
					position: 'left' as const,
					align: 'center' as const,
					labels: {
						boxWidth: 10,
						boxHeight: 10,
						usePointStyle: true,
						pointStyle: 'rect' as const,
						padding: 10,
						font: { size: 11 },
					},
				},
				tooltip: {
					callbacks: {
						label: (context: { label?: string; parsed?: number; dataset?: { data: number[] } }) => {
							const label = context.label ?? '';
							const value = context.parsed ?? 0;
							const total = (context.dataset?.data ?? []).reduce((a: number, b: number) => a + b, 0);
							const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
							return `${label}: ${nf.format(value)} (${percentage}%)`;
						},
					},
				},
			},
		}),
		[nf],
	);

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Title order={5} fw={700} fz='md'>{title}</Title>
				<div style={{ height: 320, position: 'relative' }}>
					<Doughnut data={data} options={options} />
				</div>
			</Stack>
		</Card>
	);
}
