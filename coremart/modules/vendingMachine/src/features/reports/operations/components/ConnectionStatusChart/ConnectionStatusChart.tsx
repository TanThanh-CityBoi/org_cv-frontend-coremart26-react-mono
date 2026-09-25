import { Box, Card, MantineStyleProps, Title } from '@mantine/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { TFunction } from 'i18next';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { REPORT_PALETTE_BORDERS } from '../../../../../components/reportChartTheme';
import { REPORT_PALETTE_FILLS } from '../../../../../components/reportChartTheme';
import { ConnectionStatus } from '../../../../kiosks/types';
import { KioskStats } from '../../type';


ChartJS.register(ArcElement, Tooltip, Legend);


const getChartData = (connectionStatus: KioskStats['connectionStatus'], translate: TFunction) => {
	const fastCount = connectionStatus.find((status) => status.value === ConnectionStatus.FAST)?.count ?? 0;
	const slowCount = connectionStatus.find((status) => status.value === ConnectionStatus.SLOW)?.count ?? 0;
	const disconnectedCount = connectionStatus.find((status) => status.value === ConnectionStatus.LOST)?.count ?? 0;

	return{
		labels: [
			translate('overview.connection.fast'),
			translate('overview.connection.slow'),
			translate('overview.connection.lost'),
		],
		datasets: [
			{
				label: translate('overview.connection.status'),
				data: [fastCount, slowCount, disconnectedCount],
				backgroundColor: [
					REPORT_PALETTE_FILLS.emerald,
					REPORT_PALETTE_FILLS.gold,
					REPORT_PALETTE_FILLS.crimson,
				],
				borderColor: [
					REPORT_PALETTE_BORDERS.emerald,
					REPORT_PALETTE_BORDERS.gold,
					REPORT_PALETTE_BORDERS.crimson,
				],
				borderWidth: 1,
			},
		],
	};
};

interface ConnectionStatusChartProps {
	data?: KioskStats['connectionStatus'];
	h: MantineStyleProps['h'];
}

export function ConnectionStatusChart({ data, h = '100%' }: ConnectionStatusChartProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');
	const chartData = getChartData(data ?? [], translate);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: '60%',
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: {
					boxWidth: 10,
					boxHeight: 10,
					usePointStyle: true,
					pointStyle: 'rect',
					pointRadius: 5,
					pointHoverRadius: 7,
				},
				align: 'center' as const,
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const label = context.label || '';
						const value = context.parsed || 0;
						const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
						const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
						return `${label}: ${value} (${percentage}%)`;
					},
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='sm' radius='md' withBorder h={h}>
			<Title order={4} mb='xs' fz='sm'>
				{translate('overview.connection.status')}
			</Title>
			<Box h={h} pos='relative'>
				<Doughnut data={chartData} options={options} />
			</Box>
		</Card>
	);
}
