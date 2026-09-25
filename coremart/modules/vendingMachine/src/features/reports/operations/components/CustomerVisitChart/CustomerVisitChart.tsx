import { Card, Stack, Text, Title } from '@mantine/core';
import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from 'chart.js';
import { TFunction } from 'i18next';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { GroupTime } from '@/types';

import { KioskVisitor } from '../../type';


ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
	Filler,
);

interface CustomerVisitChartProps {
	visitors: KioskVisitor[];
}


function formatBucketLabel(bucketTime: string, bucketType: GroupTime): string {
	const d = new Date(bucketTime);
	if (bucketType === 'hour') return `${d.getUTCHours()}:00`;
	if (bucketType === 'day') return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
	if (bucketType === 'month') return `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
	return String(d.getUTCFullYear());
}

const getChartData = (visitors: KioskVisitor[], translate: TFunction) => {
	const labels = visitors.map(v => formatBucketLabel(v.bucketTime, v.bucketType));
	const counts = visitors.map(v => v.visitorCount);

	return {
		labels,
		datasets: [
			{
				label: translate('coremart.vendingMachine.overview.customerVisit.visits'),
				data: counts,
				borderColor: 'rgba(59, 130, 246, 1)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
				fill: true,
			},
		],
	};
};

export function CustomerVisitChart({ visitors }: CustomerVisitChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const data = getChartData(visitors, translate);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			mode: 'index' as const,
			intersect: false,
		},
		plugins: {
			legend: {
				position: 'top' as const,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: translate('coremart.vendingMachine.overview.customerVisit.count'),
				},
			},
			x: {
				title: {
					display: true,
					text: translate('coremart.vendingMachine.overview.customerVisit.date'),
				},
			},
		},
	};

	return (
		<Card shadow='sm' padding='sm' radius='md' withBorder h='100%'>
			<Stack gap={4}>
			<Title order={4} fz='sm'>
				{translate('coremart.vendingMachine.overview.customerVisit.title')}
			</Title>
			<Text size='xs' c='dimmed'>
				{translate('coremart.vendingMachine.overview.customerVisit.description')}
			</Text>
			</Stack>
			<div style={{ height: '350px', position: 'relative' }}>
				<Line data={data} options={options} />
			</div>
		</Card>
	);
}
