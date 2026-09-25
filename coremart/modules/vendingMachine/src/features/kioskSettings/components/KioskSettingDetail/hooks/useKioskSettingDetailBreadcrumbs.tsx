import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import { KioskSetting } from '../../../types';


export function useKioskSettingDetailBreadcrumbs({ setting }: { setting?: KioskSetting }): BreadcrumbItem[] {
	const { t: translate } = useTranslation('vending_machine');

	return useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('kiosk_settings.title'), href: '../kiosk-settings' },
		{ title: setting?.name || translate('kiosk_settings.detail.title'), href: '#' },
	], [setting?.name, translate]);
}
