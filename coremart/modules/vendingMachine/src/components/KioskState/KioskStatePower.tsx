import React from 'react';


import { formatKioskStateNumber, getKioskState } from './kioskState.helpers';
import { KioskStateMetric, type KioskStateMetricProps } from './KioskStateMetric';

import type { Kiosk } from '@/features/kiosks/types';


export type KioskStatePowerProps = Omit<KioskStateMetricProps, 'value'> & {
	kiosk?: Kiosk | null;
};

export const KioskStatePower: React.FC<KioskStatePowerProps> = ({ kiosk, ...rest }) => {
	const value = formatKioskStateNumber(getKioskState(kiosk)?.power, { unit: ' W', decimals: 1 });
	return <KioskStateMetric value={value} {...rest} />;
};
