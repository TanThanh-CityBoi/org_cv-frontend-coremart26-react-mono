
import { Card, Stack, Title } from '@mantine/core';
import {
	ArcElement,
	Chart as ChartJS,
	Legend,
	Tooltip,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { fmtCurrency } from '../../../../../common/helpers';
import {
	REPORT_PALETTE_BORDERS,
	REPORT_PALETTE_FILLS,
	reportPaletteKeyAt,
} from '../../../../../components/reportChartTheme';
import { usePaymentList, type PaymentMethod } from '../../../../payment';

import type { PaymentMethodMetricRow } from './PaymentMethodMetricBarChart';


ChartJS.register(ArcElement, Tooltip, Legend);

type PaymentMethodRevenueDoughnutChartProps = {
	data: PaymentMethodMetricRow[],
	title?: string,
};

export function PaymentMethodRevenueDoughnutChart({
	data,
	title,
}: PaymentMethodRevenueDoughnutChartProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');
	const { payments } = usePaymentList();

	const labeled = useMemo(
		() => data.map((item, index) => ({
			...item,
			label: item.label
				?? payments?.find((p: PaymentMethod) => p.id === item.paymentMethodId)?.name
				?? translate('reports.revenue_report.payment_fallback', {
					index: index + 1,
				}),
		})),
		[data, payments, translate],
	);
	const total = useMemo(() => data.reduce((sum, item) => sum + Number(item.revenue ?? 0), 0), [data]);

	const chartData = useMemo(() => {
		const backgrounds = labeled.map((_, i) => REPORT_PALETTE_FILLS[reportPaletteKeyAt(i)]);
		const borders = labeled.map((_, i) => REPORT_PALETTE_BORDERS[reportPaletteKeyAt(i)]);
		return {
			labels: labeled.map((r) => r.label),
			datasets: [
				{
					data: labeled.map((r) => r.revenue),
					backgroundColor: backgrounds,
					borderColor: borders,
					borderWidth: 1,
				},
			],
		};
	}, [labeled]);

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
							const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
							const label = context.label ?? '';
							return `${label}: ${fmtCurrency(value)} (${percentage}%)`;
						},
					},
				},
			},
		}),
		[total],
	);

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				{title ? (
					<Title order={4} fw={600}>
						{title}
					</Title>
				) : null}
				<div style={{ height: 300, position: 'relative' }}>
					<Doughnut data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
