import React from 'react';

import type { Kiosk } from '@/features/kiosks/types';

import { formatKioskStateNumber, getKioskState } from './kioskState.helpers';
import { KioskStateMetric, type KioskStateMetricProps } from './KioskStateMetric';


export type KioskStateTemperatureProps = Omit<KioskStateMetricProps, 'value'> & {
	kiosk?: Kiosk | null;
};

export const KioskStateTemperature: React.FC<KioskStateTemperatureProps> = ({ kiosk, ...rest }) => {
	const value = formatKioskStateNumber(getKioskState(kiosk)?.temperature, { unit: '°C', decimals: 1 });
	return <KioskStateMetric value={value} {...rest} />;
};
