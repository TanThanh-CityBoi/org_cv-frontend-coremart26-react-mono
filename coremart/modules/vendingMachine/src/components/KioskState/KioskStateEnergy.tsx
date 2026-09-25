import React from 'react';


import { formatKioskStateNumber, getKioskState } from './kioskState.helpers';
import { KioskStateMetric, type KioskStateMetricProps } from './KioskStateMetric';

import type { Kiosk } from '../../features/kiosks/types';


export type KioskStateEnergyProps = Omit<KioskStateMetricProps, 'value'> & {
	kiosk?: Kiosk | null,
};

export const KioskStateEnergy: React.FC<KioskStateEnergyProps> = ({ kiosk, ...rest }) => {
	const value = formatKioskStateNumber(getKioskState(kiosk)?.energy, { unit: ' kWh', decimals: 3 });
	return <KioskStateMetric value={value} {...rest} />;
};
