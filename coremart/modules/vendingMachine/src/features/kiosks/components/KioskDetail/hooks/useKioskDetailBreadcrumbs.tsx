import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk } from '../../..';
import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';


export const useKioskDetailBreadcrumbs = ({ kiosk }: { kiosk?: Kiosk }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation('vending_machine');

	return useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('kiosk.detail.title'), href: '#' },
	], [kiosk?.name, translate]);
};
