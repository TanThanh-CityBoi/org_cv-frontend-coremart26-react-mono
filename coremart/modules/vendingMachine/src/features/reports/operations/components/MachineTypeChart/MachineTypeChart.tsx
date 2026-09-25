import { Box, Card, MantineStyleProps, Title } from '@mantine/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { KIOSK_TYPES } from '@/features/kioskModels/types';
import { KioskStats } from '../../type';


ChartJS.register(ArcElement, Tooltip, Legend);

interface MachineTypeChartProps {
	data?: KioskStats['goodsCollector'];
	h: MantineStyleProps['h'];
}

export function MachineTypeChart({ data, h = '100%' }: MachineTypeChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const dropProductCount = data?.find((goodsCollector) => goodsCollector.value === KIOSK_TYPES.NON_ELEVATOR)?.count ?? 0;
	const elevatorCount = data?.find((goodsCollector) => goodsCollector.value === KIOSK_TYPES.ELEVATOR)?.count ?? 0;

	const chartData = {
		labels: [
			translate('coremart.vendingMachine.overview.machineType.dropProduct'),
			translate('coremart.vendingMachine.overview.machineType.elevator'),
		],
		datasets: [
			{
				label: translate('coremart.vendingMachine.overview.machineType.distribution'),
				data: [dropProductCount, elevatorCount],
				backgroundColor: [
					'rgba(34, 197, 94, 0.8)', // green
					'rgba(59, 130, 246, 0.8)', // blue
				],
				borderColor: [
					'rgba(34, 197, 94, 1)',
					'rgba(59, 130, 246, 1)',
				],
				borderWidth: 1,
			},
		],
	};

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
				{translate('coremart.vendingMachine.overview.machineType.distribution')}
			</Title>
			<Box h={h} pos='relative'>
				<Doughnut data={chartData} options={options} />
			</Box>
		</Card>
	);
}
