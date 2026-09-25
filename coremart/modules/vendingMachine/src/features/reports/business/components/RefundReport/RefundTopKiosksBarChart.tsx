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

import { fmtShortNumber } from '@/common/helpers';

import type { KioskRefundBreakdown } from './type';




ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type RefundTopKiosksBarChartProps = {
	data: KioskRefundBreakdown[];
	maxDisplay?: number;
	title?: string;
};

export function RefundTopKiosksBarChart({
	data,
	maxDisplay = 8,
	title,
}: RefundTopKiosksBarChartProps): React.ReactElement {
	const { t: translate } = useTranslation();
	const [activeTab, setActiveTab] = useState<string | null>('amount');

	const sortedData = useMemo(() => {
		const sorted = [...data].sort((a, b) => {
			if (activeTab === 'amount') {
				return b.refundAmount - a.refundAmount;
			}
			return b.refundOrders - a.refundOrders;
		});
		const topItems = sorted.slice(0, maxDisplay);
		if (sorted.length > maxDisplay) {
			const rest = sorted.slice(maxDisplay);
			const otherAmount = rest.reduce((s, k) => s + k.refundAmount, 0);
			const otherOrders = rest.reduce((s, k) => s + k.refundOrders, 0);
			return [
				...topItems,
				{
					kioskName: translate('coremart.vendingMachine.reports.refundReport.charts.otherKiosks'),
					refundAmount: otherAmount,
					refundOrders: otherOrders,
				},
			];
		}
		return topItems;
	}, [data, maxDisplay, activeTab, translate]);

	const truncateName = (name: string, maxLen = 28): string => {
		if (name.length <= maxLen) return name;
		return `${name.slice(0, maxLen - 3)}…`;
	};

	const chartData = {
		labels: sortedData.map((d) => truncateName(d.kioskName)),
		datasets: [
			{
				label:
					activeTab === 'amount'
						? translate('coremart.vendingMachine.reports.refundReport.charts.refundAmountAxis')
						: translate('coremart.vendingMachine.reports.refundReport.charts.refundOrderAxis'),
				data:
					activeTab === 'amount'
						? sortedData.map((d) => d.refundAmount)
						: sortedData.map((d) => d.refundOrders),
				backgroundColor: activeTab === 'amount' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(249, 115, 22, 0.65)',
				borderColor: activeTab === 'amount' ? 'rgba(239, 68, 68, 1)' : 'rgba(249, 115, 22, 1)',
				borderWidth: 1,
				borderRadius: 4,
				maxBarThickness: 12,
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
					title: (items: { dataIndex: number }[]) => {
						const i = items[0]?.dataIndex;
						return i !== undefined ? sortedData[i].kioskName : '';
					},
					label: (context: any) => {
						const value = context.parsed?.x ?? 0;
						if (activeTab === 'amount') {
							return `${translate('coremart.vendingMachine.reports.refundReport.charts.tooltipRefund')}: ${new Intl.NumberFormat('vi-VN').format(value)}`;
						}
						return `${translate('coremart.vendingMachine.reports.refundReport.charts.tooltipOrders')}: ${new Intl.NumberFormat('vi-VN').format(value)}`;
					},
				},
			},
		},
		scales: {
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text:
						activeTab === 'amount'
							? translate('coremart.vendingMachine.reports.refundReport.charts.refundAmountAxis')
							: translate('coremart.vendingMachine.reports.refundReport.charts.refundOrderAxis'),
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
	};

	const chartHeight = Math.max(280, sortedData.length * 40);

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
			<Stack gap='md'>
				<Group justify='space-between' align='center' wrap='wrap'>
					<Title order={4} fw={600}>
						{title ?? ''}
					</Title>
					<Radio.Group value={activeTab} onChange={setActiveTab}>
						<Group gap='md'>
							<Radio
								value='amount'
								label={translate('coremart.vendingMachine.reports.refundReport.charts.radioRefundAmount')}
								size='xs'
							/>
							<Radio
								value='orders'
								label={translate('coremart.vendingMachine.reports.refundReport.charts.radioRefundOrders')}
								size='xs'
							/>
						</Group>
					</Radio.Group>
				</Group>
				<div style={{ height: chartHeight, position: 'relative' }}>
					<Bar data={chartData} options={chartOptions} />
				</div>
			</Stack>
		</Card>
	);
}
