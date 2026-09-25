import { IconArrowLeft, IconFileInvoice, IconHistory, IconReceiptRefund } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '@/components/ControlPanel';

import { VdOrder } from '../../../types';


type UseOrderDetailPageConfigArgs = {
	order?: VdOrder;
	onRefund: () => void;
	onInvoice: () => void;
	onHistory: () => void;
};

export const useOrderDetailPageConfig = ({
	order,
	onRefund,
	onInvoice,
	onHistory,
}: UseOrderDetailPageConfigArgs) => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
			{ title: translate('coremart.vendingMachine.menu.orders'), href: '../reports/orders' },
			{ title: order?.orderCode || '—', href: '#' },
		],
		[translate, order?.orderCode],
	);

	const actions = useMemo<ControlPanelActionItem[]>(
		() => [
			{
				label: translate('nikki.general.actions.back'),
				onClick: () => navigate('../reports/orders'),
				leftSection: <IconArrowLeft size={16} />,
				variant: 'outline',
			},
			{
				label: translate('coremart.vendingMachine.orders.actions.refund'),
				onClick: onRefund,
				leftSection: <IconReceiptRefund size={16} />,
				variant: 'outline',
				color: 'orange',
			},
			{
				label: translate('coremart.vendingMachine.orders.actions.invoice'),
				onClick: onInvoice,
				leftSection: <IconFileInvoice size={16} />,
				variant: 'outline',
				color: 'teal',
			},
			{
				label: translate('coremart.vendingMachine.orders.actions.history'),
				onClick: onHistory,
				leftSection: <IconHistory size={16} />,
				variant: 'outline',
				color: 'indigo',
			},
		],
		[translate, navigate, onRefund, onInvoice, onHistory],
	);

	return { breadcrumbs, actions };
};
