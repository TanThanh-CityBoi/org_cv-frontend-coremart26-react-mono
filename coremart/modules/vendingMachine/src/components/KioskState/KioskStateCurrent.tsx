import React from 'react';


import { formatKioskStateNumber, getKioskState } from './kioskState.helpers';
import { KioskStateMetric, type KioskStateMetricProps } from './KioskStateMetric';

import type { Kiosk } from '../../features/kiosks/types';


export type KioskStateCurrentProps = Omit<KioskStateMetricProps, 'value'> & {
	kiosk?: Kiosk | null,
};

export const KioskStateCurrent: React.FC<KioskStateCurrentProps> = ({ kiosk, ...rest }) => {
	const value = formatKioskStateNumber(getKioskState(kiosk)?.current, { unit: ' A', decimals: 3 });
	return <KioskStateMetric value={value} {...rest} />;
};
