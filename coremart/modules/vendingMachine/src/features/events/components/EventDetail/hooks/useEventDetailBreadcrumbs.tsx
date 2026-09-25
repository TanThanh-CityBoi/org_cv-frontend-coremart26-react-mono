import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { Event } from '@/features/events/types';


export const useEventDetailBreadcrumbs = ({ event }: { event?: Event }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
		{ title: translate('coremart.vendingMachine.menu.events'), href: '../events' },
		{ title: event?.name || translate('coremart.vendingMachine.events.detail.title'), href: '#' },
	], [event?.name, translate]);
};
