import { IconPlus } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '../../../../../components/ControlPanel';
import { useRegisterEventDetailTab } from '../eventDetailTabControl';


export function buildEventStockListActions(
	translate: ReturnType<typeof useTranslation>['t'],
	actions: { handleAddStock: () => void },
): ControlPanelProps['actions'] {
	return [
		{
			label: translate('events.actions.add_stock', {
				defaultValue: 'Add product',
			}),
			leftSection: <IconPlus size={16} />,
			onClick: actions.handleAddStock,
			variant: 'filled' as const,
		},
	];
}

export type UseEventStockListTabArgs = {
	handleAddStock: () => void,
};

export function useEventStockListTab({ handleAddStock }: UseEventStockListTabArgs): void {
	const { t: translate } = useTranslation('vending_machine');

	const panelActions = useMemo(
		() => buildEventStockListActions(translate, { handleAddStock }),
		[translate, handleAddStock],
	);

	useRegisterEventDetailTab('products', panelActions);
}
