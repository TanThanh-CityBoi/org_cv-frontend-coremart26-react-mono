
import { Card, Group, Stack, Text, Title } from '@mantine/core';
import {
	ArcElement,
	Chart as ChartJS,
	Legend,
	Tooltip,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import {
	REPORT_PALETTE_BORDERS,
	REPORT_PALETTE_FILLS,
	reportPaletteKeyAt,
} from '../../../../../components/reportChartTheme';

import type { MethodRefundRateRow } from './type';


ChartJS.register(ArcElement, Tooltip, Legend);

type RefundMethodRateChartProps = {
	rows: MethodRefundRateRow[],
	title?: string,
};

export function RefundMethodRateChart({ rows, title }: RefundMethodRateChartProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const nf = useMemo(() => new Intl.NumberFormat('vi-VN'), []);

	const chartData = useMemo(() => {
		const backgrounds = rows.map((_, i) => REPORT_PALETTE_FILLS[reportPaletteKeyAt(i)]);
		const borders = rows.map((_, i) => REPORT_PALETTE_BORDERS[reportPaletteKeyAt(i)]);
		return {
			labels: rows.map((r) => r.label),
			datasets: [
				{
					data: rows.map((r) => r.refundAmount),
					backgroundColor: backgrounds,
					borderColor: borders,
					borderWidth: 1,
				},
			],
		};
	}, [rows, translate]);

	const chartOptions = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			cutout: '60%',
			plugins: {
				legend: {
					position: 'right' as const,
					align: 'center' as const,
					labels: {
						boxWidth: 10,
						boxHeight: 10,
						usePointStyle: true,
						padding: 10,
						font: { size: 11 },
					},
				},
				tooltip: {
					callbacks: {
						label: (context: any) => {
							const value = Number(context.parsed) || 0;
							const dataArr = (context.dataset?.data ?? []) as number[];
							const total = dataArr.reduce((a, b) => a + b, 0);
							const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
							const label = context.label ?? '';
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
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<Title order={4} fw={600}>
						{title ?? ''}
					</Title>
					<Text size='xs' c='dimmed' maw={360}>
						{translate('reports.refund_report.charts.method_rate_hint')}
					</Text>
				</Group>
				<div style={{ height: 300, position: 'relative' }}>
					<Doughnut data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
