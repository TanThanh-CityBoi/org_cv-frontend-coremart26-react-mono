import { Group, SimpleGrid, Text, Tooltip } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { formatDateTime, getDate } from '@/common/helpers';

import { getKioskState } from './kioskState.helpers';
import { KioskStateCurrent } from './KioskStateCurrent';
import { KioskStateEnergy } from './KioskStateEnergy';
import { KioskStateHumidity } from './KioskStateHumidity';
import { KioskStateOutputDoorSwitch } from './KioskStateOutputDoorSwitch';
import { KioskStatePower } from './KioskStatePower';
import { KioskStateTemperature } from './KioskStateTemperature';

import type { Kiosk } from '@/features/kiosks/types';


type KioskStateMetricLineProps = {
	label: string;
	children: React.ReactNode;
};

function KioskStateMetricLine({ label, children }: KioskStateMetricLineProps) {
	return (
		<Group gap={6} wrap='nowrap' align='center'>
			<Text size='xs' c='dimmed' miw={72}>{label}: </Text>
			{children}
		</Group>
	);
}

export type KioskStateMetricsSummaryProps = {
	kiosk?: Kiosk | null;
};

/** Compact telemetry block for grid cards and similar list layouts. */
export const KioskStateMetricsSummary: React.FC<KioskStateMetricsSummaryProps> = ({ kiosk }) => {
	const { t: translate } = useTranslation();

	const bucketTime = getKioskState(kiosk)?.bucketTime;
	const reportTime = getDate(bucketTime ?? '') ? formatDateTime(bucketTime ?? '') : null;
	const reportTimeLabel = `${translate('coremart.vendingMachine.kiosk.state.updatedAt')}: ${reportTime}`;
	const tooltipLabel = reportTime ? reportTimeLabel : translate('coremart.vendingMachine.kiosk.state.noData');

	return (
		<Tooltip label={tooltipLabel} position='left-start' withArrow multiline>
			<SimpleGrid cols={2} spacing='xs'>
				<KioskStateMetricLine label={translate('coremart.vendingMachine.kiosk.state.temperature')}>
					<KioskStateTemperature kiosk={kiosk} size='xs' fw={500} />
				</KioskStateMetricLine>
				<KioskStateMetricLine label={translate('coremart.vendingMachine.kiosk.state.humidity')}>
					<KioskStateHumidity kiosk={kiosk} size='xs' fw={500} />
				</KioskStateMetricLine>
				<KioskStateMetricLine label={translate('coremart.vendingMachine.kiosk.state.current')}>
					<KioskStateCurrent kiosk={kiosk} size='xs' fw={500} />
				</KioskStateMetricLine>
				<KioskStateMetricLine label={translate('coremart.vendingMachine.kiosk.state.energy')}>
					<KioskStateEnergy kiosk={kiosk} size='xs' fw={500} />
				</KioskStateMetricLine>
				<KioskStateMetricLine label={translate('coremart.vendingMachine.kiosk.state.power')}>
					<KioskStatePower kiosk={kiosk} size='xs' fw={500} />
				</KioskStateMetricLine>
				<KioskStateMetricLine label={translate('coremart.vendingMachine.kiosk.state.outputDoorSwitch')}>
					<KioskStateOutputDoorSwitch kiosk={kiosk} size='xs' />
				</KioskStateMetricLine>
			</SimpleGrid>
		</Tooltip>
	);
};
