import React from 'react';


import { getKioskState } from './kioskState.helpers';
import { KioskStateSwitch, type KioskStateSwitchProps } from './KioskStateSwitch';

import type { Kiosk } from '@/features/kiosks/types';


export type KioskStateOutputSwitchProps = Omit<KioskStateSwitchProps, 'value'> & {
	kiosk?: Kiosk | null;
};

export const KioskStateOutputSwitch: React.FC<KioskStateOutputSwitchProps> = ({ kiosk, ...rest }) => (
	<KioskStateSwitch value={getKioskState(kiosk)?.outputSwitch} {...rest} />
);
