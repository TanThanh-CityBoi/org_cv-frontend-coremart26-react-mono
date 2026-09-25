import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { Kiosk } from '@/features/kiosks';


export const useKioskDetailBreadcrumbs = ({ kiosk }: { kiosk?: Kiosk }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
		{ title: translate('coremart.vendingMachine.kiosk.title'), href: '../kiosks' },
		{ title: kiosk?.name || translate('coremart.vendingMachine.kiosk.detail.title'), href: '#' },
	], [kiosk?.name, translate]);
};
