import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '@/components/BreadCrumbs';

import { KioskSetting } from '../../../types';


export function useKioskSettingDetailBreadcrumbs({ setting }: { setting?: KioskSetting }): BreadcrumbItem[] {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
		{ title: translate('coremart.vendingMachine.kioskSettings.title'), href: '../kiosk-settings' },
		{ title: setting?.name || translate('coremart.vendingMachine.kioskSettings.detail.title'), href: '#' },
	], [setting?.name, translate]);
}
