import { Card, Title } from '@mantine/core';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
} from 'chart.js';


import { TFunction } from 'i18next';
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

import { GroupTime } from '@/types';

import { type KioskStateAnalytic } from '../../type';



ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	BarController,
	LineController,
	Tooltip,
	Legend
  );

interface KioskAnalyticsChartProps {
	analytics: KioskStateAnalytic[];
}

function formatBucketLabel(bucketTime: string, bucketType: GroupTime): string {
	const d = new Date(bucketTime);
	if (bucketType === 'hour') return `${d.getUTCHours()}:00`;
	if (bucketType === 'day') return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
	if (bucketType === 'month') return `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
	return String(d.getUTCFullYear());
}

function createDataset(
	label: string,
	data: number[],
	borderColor: string,
	backgroundColor: string,
	yAxisID: string,
): {
	label: string;
	data: number[];
	borderColor: string;
	backgroundColor: string;
	yAxisID: string;
	tension: number;
} {
	return { label, data, borderColor, backgroundColor, yAxisID, tension: 0.4 };
}

const convertToDataset = (analytics: KioskStateAnalytic[], translate: TFunction) => {
	const bucketType = analytics[0]?.bucketType ?? 'day';
	const labels = analytics.map(a => formatBucketLabel(a.bucketTime, bucketType));

	const y1Dataset = createDataset(
		translate('coremart.vendingMachine.overview.operationParams.energy'),
		analytics.map(a => a.energyDelta),
		'rgba(34, 197, 94, 1)',
		'rgba(34, 197, 94, 0.6)',
		'y1',
	);
	
	return {
		labels,
		datasets: [
			createDataset(
				translate('coremart.vendingMachine.overview.operationParams.temperature'),
				analytics.map(a => a.temperature),
				'rgba(239, 68, 68, 1)',
				'rgba(239, 68, 68, 0.1)',
				'y',
			),
			createDataset(
				translate('coremart.vendingMachine.overview.operationParams.humidity'),
				analytics.map(a => a.humidity),
				'rgba(59, 130, 246, 1)',
				'rgba(59, 130, 246, 0.1)',
				'y',
			),
			{...y1Dataset, type: 'bar' as const, barThickness: 20, borderRadius: 4},
		],
	};
};

const getChartOptions = (translate: TFunction) => ({
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
			type: 'linear' as const,
			display: true,
			position: 'left' as const,
			title: {
				display: true,
				text: translate('coremart.vendingMachine.overview.operationParams.temperatureHumidity'),
			},
		},
		y1: {
			type: 'linear' as const,
			display: true,
			position: 'right' as const,
			grid: { drawOnChartArea: false },
			title: {
				display: true,
				text: translate('coremart.vendingMachine.overview.operationParams.energy'),
			},
		},
	},
});

export function KioskAnalyticsChart({ analytics }: KioskAnalyticsChartProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const data = useMemo(() => convertToDataset(analytics, translate), [analytics, translate]);
	const options = getChartOptions(translate);

	return (
		<Card shadow='sm' padding='lg' radius='md' withBorder>
			<Title order={4} mb='md'>
				{translate('coremart.vendingMachine.overview.operationParams.title')}
			</Title>
			<div style={{ height: '350px', position: 'relative' }}>
				<Chart type='line' data={data} options={options} />
			</div>
		</Card>
	);
}
