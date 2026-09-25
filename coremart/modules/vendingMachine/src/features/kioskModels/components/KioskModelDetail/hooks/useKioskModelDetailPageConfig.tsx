import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


import { ControlPanelActionItem } from '../../../../../components/ControlPanel';
import { KioskModel } from '../../../types';
import { KioskModelBasicInfo } from '../KioskModelBasicInfo';
import { useKioskModelDetailTabControl } from '../kioskModelDetailTabControl';
import { KioskModelSettings } from '../KioskModelSettings';
import { useKioskModelDetailBreadcrumbs } from './useKioskModelDetailBreadcrumbs';

import type { KioskModelDetailTabId, UseKioskModelDetailPageConfigReturn } from './types';



type DetailTabConfig = {
	id: KioskModelDetailTabId,
	title: string,
	content: () => React.ReactNode,
};

const useKioskModelDetailTabs = ({ model }: { model?: KioskModel }): Array<DetailTabConfig> => {
	const { t: translate } = useTranslation('vending_machine');
	const tabs = useMemo<Array<DetailTabConfig>>(() => {
		if (!model) return [];
		return [
			{
				id: 'basicInfo',
				title: translate('kiosk_models.tabs.basic_info'),
				content: () => <KioskModelBasicInfo key='basicInfo' model={model} />,
			},
			{
				id: 'modelSettings',
				title: translate('kiosk_models.tabs.model_settings'),
				content: () => <KioskModelSettings key='modelSettings' model={model} />,
			},
		];
	}, [model]);

	return tabs;
};

const useTabActions = ({ activeTab }: { activeTab: KioskModelDetailTabId }): ControlPanelActionItem[] => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');
	const { registry } = useKioskModelDetailTabControl();

	const actions = useMemo<ControlPanelActionItem[]>(() => {
		const baseActions = [{
			label: translate('action.back'),
			onClick: () => navigate('../kiosk-models'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];

		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);

	return actions;
};


export const useKioskModelDetailPageConfig = (
	{ model }: { model?: KioskModel },
): UseKioskModelDetailPageConfigReturn => {
	const [activeTab, setActiveTab] = useState<KioskModelDetailTabId>('basicInfo');
	const onTabChange = useCallback((tab: string) => setActiveTab(tab as KioskModelDetailTabId), []);

	const breadcrumbs = useKioskModelDetailBreadcrumbs({ model });
	const tabs = useKioskModelDetailTabs({ model });
	const actions = useTabActions({ activeTab });

	return useMemo(() => ({
		breadcrumbs,
		actions,
		tabs,
		activeTab,
		onTabChange,
	}), [breadcrumbs, actions, tabs, activeTab, onTabChange]);
};
