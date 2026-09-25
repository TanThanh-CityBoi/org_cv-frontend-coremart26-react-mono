import { IconBolt, IconDroplet, IconTemperature } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { GroupedStatCard } from '../../../../../components/GroupedStatCard';
import { OperationStats } from '../../type';



interface OperationStatsCardProps {
	operationStats?: OperationStats;
}

export function OperationStatsCard({ operationStats }: OperationStatsCardProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const energyConsumption = operationStats?.totalEnergy ?? 0;
	const avgTemperature = operationStats?.averageTemperature ?? 0;
	const avgHumidity = operationStats?.averageHumidity ?? 0;

	const items = [
		{
			label: translate('overview.operation_params.total_power_consumption'),
			value: energyConsumption ? Number(energyConsumption).toFixed(1) : 0,
			suffix: 'kW',
			icon: <IconBolt size={16} />,
			color: 'green',
		},
		{
			label: translate('overview.operation_params.avg_temperature'),
			value: avgTemperature ? Number(avgTemperature).toFixed(1) : 0,
			suffix: '°C',
			icon: <IconTemperature size={16} />,
			color: 'red',
		},
		{
			label: translate('overview.operation_params.avg_humidity'),
			value: avgHumidity ? Number(avgHumidity).toFixed(1) : 0,
			suffix: '%',
			icon: <IconDroplet size={16} />,
			color: 'blue',
		},
	];

	return (
		<GroupedStatCard
			title={translate('overview.operation_params.title')}
			icon={<IconBolt size={24} />}
			iconColor='green'
			items={items}
		/>
	);
}
