import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';



import { ControlPanelActionItem } from '@/components/ControlPanel';
import { useKioskDetailTabControl } from '@/features/kiosks/components/KioskDetail';
import { Kiosk } from '@/features/kiosks/types';

import { KioskActivity } from '../KioskActivity';
import { KioskBasicInfo } from '../KioskBasicInfo';
import { KioskDisplaySettings } from '../KioskDisplaySettings';
import { KioskOperationalSettings } from '../KioskOperationalSettings';
import { KioskStockList } from '../KioskStock';
import { useKioskDetailBreadcrumbs } from './useKioskDetailBreadcrumbs';
import { KioskStockGrid } from '../KioskStockGrid';
import { UseKioskDetailPageConfigProps, UseKioskDetailPageConfigReturn } from './types';
import {KioskDetailTabs} from './types';



type DetailTabConfig = {
	id: KioskDetailTabs;
	title: string;
	content: () => React.ReactNode;
};

const useKioskDetailTabs = ({kiosk}: {kiosk?: Kiosk}): Array<DetailTabConfig> => {
	const {t: translate} = useTranslation();
	const tabs = useMemo<Array<DetailTabConfig>>(() => {
		if (!kiosk) {
			return [];
		}
		return [
			{
				id: KioskDetailTabs.BASIC_INFO,
				title: translate('coremart.vendingMachine.kiosk.tabs.basicInfo'),
				content: () => <KioskBasicInfo key={KioskDetailTabs.BASIC_INFO} kiosk={kiosk} />,
			},
			{
				id: KioskDetailTabs.STOCK_LIST,
				title: translate('coremart.vendingMachine.kiosk.tabs.productsList'),
				content: () => <KioskStockList key={KioskDetailTabs.STOCK_LIST} kiosk={kiosk}/>,
			},
			{
				id: KioskDetailTabs.STOCK_GRID,
				title: translate('coremart.vendingMachine.kiosk.tabs.productsGrid'),
				content: () => <KioskStockGrid key={KioskDetailTabs.STOCK_GRID} kiosk={kiosk} />,
			},
			{
				id: KioskDetailTabs.OPERATIONAL_SETTINGS,
				title: translate('coremart.vendingMachine.kiosk.tabs.operationalSettings'),
				content: () => <KioskOperationalSettings key={KioskDetailTabs.OPERATIONAL_SETTINGS} kiosk={kiosk} />,
			},
			{
				id: KioskDetailTabs.DISPLAY_SETTINGS,
				title: translate('coremart.vendingMachine.kiosk.tabs.displaySettings'),
				content: () => <KioskDisplaySettings key={KioskDetailTabs.DISPLAY_SETTINGS} kiosk={kiosk} />,
			},
			{
				id: KioskDetailTabs.ACTIVITY,
				title: translate('coremart.vendingMachine.kiosk.tabs.activity'),
				content: () => <KioskActivity key={KioskDetailTabs.ACTIVITY} />,
			},
		];
	}, [kiosk]);

	return tabs;
};

const useTabActions = ({activeTab}: {activeTab: KioskDetailTabs}): ControlPanelActionItem[] => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { registry } = useKioskDetailTabControl();

	const actions = useMemo<ControlPanelActionItem[]>(() => {
		const baseActions = [{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../kiosks'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];

		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);

	return actions;
};


export const useKioskDetailPageConfig = ({kiosk}: UseKioskDetailPageConfigProps): UseKioskDetailPageConfigReturn => {
	const [activeTab, setActiveTab] = useState<KioskDetailTabs>(KioskDetailTabs.BASIC_INFO);
	const onTabChange = useCallback((tab: string) => {
		setActiveTab(tab as KioskDetailTabs);
	}, [setActiveTab]);

	const breadcrumbs = useKioskDetailBreadcrumbs({ kiosk });
	const tabs = useKioskDetailTabs({ kiosk });
	const actions = useTabActions({ activeTab });

	return useMemo(() => ({
		breadcrumbs,
		actions,
		tabs,
		activeTab,
		onTabChange,
	}), [breadcrumbs, actions, tabs, activeTab, onTabChange]);
};
