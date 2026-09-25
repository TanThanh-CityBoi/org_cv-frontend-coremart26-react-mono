import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import { Event } from '../../../types';


export const useEventDetailBreadcrumbs = ({ event }: { event?: Event }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation('vending_machine');

	return useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('menu.events'), href: '../events' },
		{ title: event?.name || translate('events.detail.title'), href: '#' },
	], [event?.name, translate]);
};
