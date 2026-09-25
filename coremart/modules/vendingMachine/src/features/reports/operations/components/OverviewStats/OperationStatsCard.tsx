import { IconBolt, IconDroplet, IconTemperature } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';

import { GroupedStatCard } from '@/components/GroupedStatCard';
import { OperationStats } from '../../type';
import { useTranslation } from 'react-i18next';



interface OperationStatsCardProps {
	operationStats?: OperationStats;
}

export function OperationStatsCard({ operationStats }: OperationStatsCardProps): React.ReactElement {
	const { t: translate } = useTranslation();
	
	const energyConsumption = operationStats?.totalEnergy ?? 0;
	const avgTemperature = operationStats?.averageTemperature ?? 0;
	const avgHumidity = operationStats?.averageHumidity ?? 0;

	const items = [
		{
			label: translate('coremart.vendingMachine.overview.operationParams.totalPowerConsumption'),
			value: energyConsumption? Number(energyConsumption).toFixed(1) : 0,
			suffix: 'kW',
			icon: <IconBolt size={16} />,
			color: 'green',
		},
		{
			label: translate('coremart.vendingMachine.overview.operationParams.avgTemperature'),
			value: avgTemperature ? Number(avgTemperature).toFixed(1) : 0,
			suffix: '°C',
			icon: <IconTemperature size={16} />,
			color: 'red',
		},
		{
			label: translate('coremart.vendingMachine.overview.operationParams.avgHumidity'),
			value: avgHumidity ? Number(avgHumidity).toFixed(1) : 0,
			suffix: '%',
			icon: <IconDroplet size={16} />,
			color: 'blue',
		},
	];

	return (
		<GroupedStatCard
			title={translate('coremart.vendingMachine.overview.operationParams.title')}
			icon={<IconBolt size={24} />}
			iconColor='green'
			items={items}
		/>
	);
}
