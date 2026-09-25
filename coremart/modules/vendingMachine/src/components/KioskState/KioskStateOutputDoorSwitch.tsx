import React from 'react';


import { getKioskState } from './kioskState.helpers';
import { KioskStateSwitch, type KioskStateSwitchProps } from './KioskStateSwitch';

import type { Kiosk } from '@/features/kiosks/types';


export type KioskStateOutputDoorSwitchProps = Omit<KioskStateSwitchProps, 'value'> & {
	kiosk?: Kiosk | null;
};

export const KioskStateOutputDoorSwitch: React.FC<KioskStateOutputDoorSwitchProps> = ({ kiosk, ...rest }) => (
	<KioskStateSwitch value={getKioskState(kiosk)?.outputDoorSwitch} {...rest} />
);
