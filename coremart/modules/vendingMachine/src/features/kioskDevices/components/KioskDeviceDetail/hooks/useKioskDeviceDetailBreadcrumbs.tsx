import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import { KioskDevice } from '../../../types';


export const useKioskDeviceDetailBreadcrumbs = ({ kioskDevice }: { kioskDevice?: KioskDevice }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation('vending_machine');

	return useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('menu.device'), href: '../kiosk-devices' },
		{ title: kioskDevice?.name || translate('device.detail.title'), href: '#' },
	], [kioskDevice?.name, translate]);
};
