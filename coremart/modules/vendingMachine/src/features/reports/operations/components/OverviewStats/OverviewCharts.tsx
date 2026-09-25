import { SimpleGrid } from '@mantine/core';
import React from 'react';

import { ConnectionStatusChart } from '../ConnectionStatusChart';
import { MachineTypeChart } from '../MachineTypeChart';
import { OperationStatusChart } from '../OperationStatusChart';
import { KioskStats } from '../../type';


interface OverviewChartsProps {
	kioskStats?: KioskStats;
}

export function OverviewCharts({ kioskStats }: OverviewChartsProps): React.ReactElement {
	return (
		<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='md' h={'max-content'}>
			<ConnectionStatusChart data={kioskStats?.connectionStatus ?? []} h={250} />
			<OperationStatusChart data={kioskStats?.operationStatus ?? []} h={250} />
			<MachineTypeChart data={kioskStats?.goodsCollector ?? []} h={250} />
		</SimpleGrid>
	);
}
