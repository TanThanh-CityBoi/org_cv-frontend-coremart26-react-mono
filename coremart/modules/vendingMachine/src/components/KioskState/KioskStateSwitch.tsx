import { Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '@/components/StatusBadge';

import { parseKioskSwitchValue } from './kioskState.helpers';


export type KioskStateSwitchProps = {
	value: string | undefined | null;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export const KioskStateSwitch: React.FC<KioskStateSwitchProps> = ({ value, size = 'sm' }) => {
	const { t: translate } = useTranslation();
	const parsed = parseKioskSwitchValue(value);

	if (parsed == null) {
		return <Text size='xs' fw={500}>—</Text>;
	}

	return (
		<StatusBadge color={parsed ? 'green' : 'gray'} size={size}>
			{parsed
				? translate('coremart.vendingMachine.kiosk.stateSwitch.on')
				: translate('coremart.vendingMachine.kiosk.stateSwitch.off')}
		</StatusBadge>
	);
};
