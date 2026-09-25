import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '../../../../../components/ControlPanel';
import { KioskDevice } from '../../../types';
import { KioskDeviceBasicInfo } from '../KioskDeviceBasicInfo';
import { useKioskDeviceDetailTabControl } from '../kioskDeviceDetailTabControl';
import { KioskDeviceSpecifications } from '../KioskDeviceSpecifications';
import { useKioskDeviceDetailBreadcrumbs } from './useKioskDeviceDetailBreadcrumbs';

import type { KioskDeviceDetailTabId, UseKioskDeviceDetailPageConfigProps, UseKioskDeviceDetailPageConfigReturn } from './types';


type DetailTabConfig = {
	id: KioskDeviceDetailTabId,
	title: string,
	content: () => React.ReactNode,
};

const useKioskDeviceDetailTabs = ({ kioskDevice }: { kioskDevice?: KioskDevice }): Array<DetailTabConfig> => {
	const { t: translate } = useTranslation('vending_machine');
	const tabs = useMemo<Array<DetailTabConfig>>(() => {
		if (!kioskDevice) return [];
		return [
			{
				id: 'basicInfo',
				title: translate('device.tabs.basic_info'),
				content: () => <KioskDeviceBasicInfo key='basicInfo' kioskDevice={kioskDevice} />,
			},
			{
				id: 'specifications',
				title: translate('device.tabs.specifications'),
				content: () => <KioskDeviceSpecifications key='specifications' kioskDevice={kioskDevice} />,
			},
		];
	}, [kioskDevice]);

	return tabs;
};

const useTabActions = ({ activeTab }: { activeTab: KioskDeviceDetailTabId }): ControlPanelActionItem[] => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');
	const { registry } = useKioskDeviceDetailTabControl();

	const actions = useMemo<ControlPanelActionItem[]>(() => {
		const baseActions = [{
			label: translate('action.back'),
			onClick: () => navigate('../kiosk-devices'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];

		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);

	return actions;
};


export const useKioskDeviceDetailPageConfig = (
	{ kioskDevice }: UseKioskDeviceDetailPageConfigProps,
): UseKioskDeviceDetailPageConfigReturn => {
	const [activeTab, setActiveTab] = useState<KioskDeviceDetailTabId>('basicInfo');
	const onTabChange = useCallback((tab: string) => setActiveTab(tab as KioskDeviceDetailTabId), []);

	const breadcrumbs = useKioskDeviceDetailBreadcrumbs({ kioskDevice });
	const tabs = useKioskDeviceDetailTabs({ kioskDevice });
	const actions = useTabActions({ activeTab });

	return useMemo(() => ({
		breadcrumbs,
		actions,
		tabs,
		activeTab,
		onTabChange,
	}), [breadcrumbs, actions, tabs, activeTab, onTabChange]);
};
