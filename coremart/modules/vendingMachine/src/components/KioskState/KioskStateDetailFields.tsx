import { Box, Divider, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { getKioskState } from './kioskState.helpers';
import { KioskStateCurrent } from './KioskStateCurrent';
import { KioskStateEnergy } from './KioskStateEnergy';
import { KioskStateHumidity } from './KioskStateHumidity';
import { KioskStateOutputDoorSwitch } from './KioskStateOutputDoorSwitch';
import { KioskStateOutputSwitch } from './KioskStateOutputSwitch';
import { KioskStatePower } from './KioskStatePower';
import { KioskStateSwitch } from './KioskStateSwitch';
import { KioskStateTemperature } from './KioskStateTemperature';

import type { Kiosk } from '@/features/kiosks/types';


type KioskStateDetailFieldItemProps = {
	label: string;
	children: React.ReactNode;
};

function KioskStateDetailFieldItem({ label, children }: KioskStateDetailFieldItemProps) {
	return (
		<Box>
			<Text size='sm' c='dimmed' mb='xs'>{label}</Text>
			{children}
		</Box>
	);
}

export type KioskStateDetailFieldsProps = {
	kiosk?: Kiosk | null;
};

export const KioskStateDetailFields: React.FC<KioskStateDetailFieldsProps> = ({ kiosk }) => {
	const { t: translate } = useTranslation();

	return (
			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.temperature')}>
					<KioskStateTemperature kiosk={kiosk} />
				</KioskStateDetailFieldItem>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.humidity')}>
					<KioskStateHumidity kiosk={kiosk} />
				</KioskStateDetailFieldItem>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.current')}>
					<KioskStateCurrent kiosk={kiosk} />
				</KioskStateDetailFieldItem>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.energy')}>
					<KioskStateEnergy kiosk={kiosk} />
				</KioskStateDetailFieldItem>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.power')}>
					<KioskStatePower kiosk={kiosk} />
				</KioskStateDetailFieldItem>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.outputDoorSwitch')}>
					<KioskStateOutputDoorSwitch kiosk={kiosk} />
				</KioskStateDetailFieldItem>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.homeSwitch')}>
					<KioskStateSwitch value={getKioskState(kiosk)?.homeSwitch ?? undefined}/>
				</KioskStateDetailFieldItem>
				<KioskStateDetailFieldItem label={translate('coremart.vendingMachine.kiosk.state.outputSwitch')}>
					<KioskStateOutputSwitch kiosk={kiosk} />
				</KioskStateDetailFieldItem>
			</SimpleGrid>
	);
};
