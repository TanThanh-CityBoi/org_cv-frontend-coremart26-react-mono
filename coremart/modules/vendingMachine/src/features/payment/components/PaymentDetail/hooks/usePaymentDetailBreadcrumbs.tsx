import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import { PaymentMethod } from '../../../types';


export const usePaymentDetailBreadcrumbs = ({ payment }: { payment?: PaymentMethod }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation('vending_machine');
	const pathname = useLocation().pathname;
	const id = pathname.split('/').pop() ?? '';

	return useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('payment.title'), href: '../payment' },
		{
			title: payment
				? payment.name || translate('payment.detail.title')
				: id,
			href: '#',
		},
	], [payment, id, translate]);
};
