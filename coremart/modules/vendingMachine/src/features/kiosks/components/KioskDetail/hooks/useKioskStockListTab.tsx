import { IconPlus, IconSortAscendingLetters } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { KioskDetailTabs } from './types';

import { ControlPanelProps } from '@/components/ControlPanel';
import { useRegisterKioskDetailTab } from '@/features/kiosks/components/KioskDetail/kioskDetailTabControl';


export function buildKioskStockListActions(
	translate: ReturnType<typeof useTranslation>['t'],
	actions: {
		handleAddStock: () => void;
		handleSortStock: () => void;
	},
): ControlPanelProps['actions'] {
	const { handleAddStock, handleSortStock } = actions;
	return [
		{
			label: translate('coremart.vendingMachine.kiosk.stocks.actions.sortStock', {
				defaultValue: 'Sắp xếp',
			}),
			leftSection: <IconSortAscendingLetters size={16} />,
			onClick: handleSortStock,
			variant: 'light' as const,
		},
		{
			label: translate('coremart.vendingMachine.kiosk.stocks.actions.addStock'),
			leftSection: <IconPlus size={16} />,
			onClick: handleAddStock,
			variant: 'filled' as const,
		},
	];
}

export type UseKioskStockListTabArgs = {
	handleAddStock: () => void;
	handleSortStock: () => void;
};

export function useKioskStockListTab({ handleAddStock, handleSortStock }: UseKioskStockListTabArgs): void {
	const { t: translate } = useTranslation();

	const actions = useMemo(
		() => buildKioskStockListActions(translate, { handleAddStock, handleSortStock }),
		[translate, handleAddStock, handleSortStock],
	);

	useRegisterKioskDetailTab(KioskDetailTabs.STOCK_LIST, actions);
}

