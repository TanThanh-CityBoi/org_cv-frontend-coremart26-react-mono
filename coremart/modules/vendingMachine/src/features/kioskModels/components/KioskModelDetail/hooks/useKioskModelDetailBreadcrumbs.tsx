import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import { KioskModel } from '../../../types';


export const useKioskModelDetailBreadcrumbs = ({ model }: { model?: KioskModel }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation('vending_machine');
	const pathname = useLocation().pathname;
	const id = pathname.split('/').pop() ?? '';

	return useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('kiosk_models.title'), href: '../kiosk-models' },
		{ title: model ? model.name || translate('kiosk_models.detail.title') : id, href: '#' },
	], [model, id, translate]);
};
