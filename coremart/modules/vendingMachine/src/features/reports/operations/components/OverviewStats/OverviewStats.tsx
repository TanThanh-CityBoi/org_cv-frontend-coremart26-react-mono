import { Box, Grid, MantineStyleProps } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CustomerVisitChart } from '../CustomerVisitChart';
import { KioskCountCard } from './KioskCountCard';
import { OverviewCharts } from './OverviewCharts';
import { OperationStatsCard } from './OperationStatsCard';
import { useKioskCountStats, useKioskVisitors, useOperationStats } from '../../hooks';


interface OverviewStatsProps {
	padding?: MantineStyleProps['p'];
	width?: MantineStyleProps['w'];
	miw?: MantineStyleProps['miw'];
}

export function OverviewStats({
	padding = 'md',
	width,
	miw,
}: OverviewStatsProps): React.ReactElement {
	const { data: operationStats } = useOperationStats();
	const { data: kioskCountStats } = useKioskCountStats();
	const { data: kioskVisitors } = useKioskVisitors();

	return (
		<Box p={padding} w={width} h={'100%'} miw={miw}>
			<Grid h={'100%'}>
				<Grid.Col span={{ base: 12, sm: 5, md: 5, lg: 5, xl: 4 }}>
					<KioskCountCard data={kioskCountStats?.archiveStatus ?? []}/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, sm: 7, md: 7, lg: 7, xl: 8 }}>
					<OperationStatsCard operationStats={operationStats}/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 12 }}>
					<OverviewCharts kioskStats={kioskCountStats} />
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 12 }} h={350}>
					<CustomerVisitChart visitors={kioskVisitors} />
				</Grid.Col>
			</Grid>
		</Box>
	);
}
