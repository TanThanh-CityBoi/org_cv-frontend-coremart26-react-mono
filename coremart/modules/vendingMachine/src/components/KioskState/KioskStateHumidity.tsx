import React from 'react';


import { formatKioskStateNumber, getKioskState } from './kioskState.helpers';
import { KioskStateMetric, type KioskStateMetricProps } from './KioskStateMetric';

import type { Kiosk } from '../../features/kiosks/types';


export type KioskStateHumidityProps = Omit<KioskStateMetricProps, 'value'> & {
	kiosk?: Kiosk | null,
};

export const KioskStateHumidity: React.FC<KioskStateHumidityProps> = ({ kiosk, ...rest }) => {
	const value = formatKioskStateNumber(getKioskState(kiosk)?.humidity, { unit: '%', decimals: 1 });
	return <KioskStateMetric value={value} {...rest} />;
};
