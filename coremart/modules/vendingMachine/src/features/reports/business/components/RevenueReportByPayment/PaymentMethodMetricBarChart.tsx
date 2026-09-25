/* eslint-disable max-lines-per-function */
import { Card, Group, Radio, Stack, Title } from '@mantine/core';
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

import { fmtCurrency, fmtNumber, fmtShortNumber } from '../../../../../common/helpers/formartNumber';
import { usePaymentList, type PaymentMethod } from '../../../../payment';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface PaymentMethodMetricRow {
	paymentMethodId: string;
	revenue: number;
	orders: number;
	/** When set, used instead of resolving name from payment catalog. */
	label?: string;
}

interface PaymentMethodMetricBarProps {
	data: PaymentMethodMetricRow[];
	title?: string;
}

export function PaymentMethodMetricBarChart({ data, title }: PaymentMethodMetricBarProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');
	const revenueAxisLabel = translate('reports.revenue_report.chart.revenue_axis_label');
	const ordersAxisLabel = translate('reports.revenue_report.chart.orders_axis_label');
	const revenueLabel = translate('reports.revenue_report.chart.radio_revenue');
	const ordersLabel = translate('reports.revenue_report.chart.radio_orders');

	const { payments } = usePaymentList();
	const [activeTab, setActiveTab] = useState<string | null>('revenue');

	const rows = useMemo(() => {
		return data.map((item, index) => {
			const paymentMethod = payments?.find((p: PaymentMethod) => p.id === item.paymentMethodId);
			return {
				...item,
				label: item.label ?? paymentMethod?.name ?? `Payment ${index + 1}`,
			};
		});
	}, [data, payments]);

	const sortedData = useMemo(() => {
		return [...rows].sort((a, b) => {
			if (activeTab === 'revenue') {
				return b.revenue - a.revenue;
			}
			return b.orders - a.orders;
		});
	}, [rows, activeTab]);


	const chartData = {
		labels: sortedData.map((d) => d.label),
		datasets: [
			{
				label: activeTab === 'revenue' ? revenueLabel : ordersLabel,
				data: activeTab === 'revenue'
					? sortedData.map((d) => d.revenue)
					: sortedData.map((d) => d.orders),
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
					label: (context: any) => {
						const value = context.parsed?.x ?? 0;
						if (activeTab === 'revenue') {
							return translate('reports.revenue_report.chart.tooltip_revenue_value', { value: fmtCurrency(value) });
						}
						return translate('reports.revenue_report.chart.tooltip_orders_value', { value: fmtNumber(value) });
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
					<Title order={4} fw={600}>
						{title ?? 'Revenue by Payment Method'}
					</Title>
					<Radio.Group value={activeTab} onChange={setActiveTab}>
						<Group gap='md'>
							<Radio value='revenue' label={revenueLabel} size='xs' />
							<Radio value='orders' label={ordersLabel} size='xs' />
						</Group>
					</Radio.Group>
				</Group>
				<div style={{ height: Math.max(260, sortedData.length * 36), position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
