import { IconPlus, IconSortAscendingLetters } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


import { ControlPanelProps } from '../../../../../components/ControlPanel';
import { useRegisterKioskDetailTab } from '../kioskDetailTabControl';
import { KioskDetailTabs } from './types';


export function buildKioskStockListActions(
	translate: ReturnType<typeof useTranslation>['t'],
	actions: {
		handleAddStock: () => void,
		handleSortStock: () => void,
	},
): ControlPanelProps['actions'] {
	const { handleAddStock, handleSortStock } = actions;
	return [
		{
			label: translate('kiosk.stocks.actions.sort_stock', {
				defaultValue: 'Sắp xếp',
			}),
			leftSection: <IconSortAscendingLetters size={16} />,
			onClick: handleSortStock,
			variant: 'light' as const,
		},
		{
			label: translate('kiosk.stocks.actions.add_stock'),
			leftSection: <IconPlus size={16} />,
			onClick: handleAddStock,
			variant: 'filled' as const,
		},
	];
}

export type UseKioskStockListTabArgs = {
	handleAddStock: () => void,
	handleSortStock: () => void,
};

export function useKioskStockListTab({ handleAddStock, handleSortStock }: UseKioskStockListTabArgs): void {
	const { t: translate } = useTranslation('vending_machine');

	const actions = useMemo(
		() => buildKioskStockListActions(translate, { handleAddStock, handleSortStock }),
		[translate, handleAddStock, handleSortStock],
	);

	useRegisterKioskDetailTab(KioskDetailTabs.STOCK_LIST, actions);
}

