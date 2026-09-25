import { IconArrowLeft } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanelActionItem } from '../../../../../components/ControlPanel';
import { Event } from '../../../types';
import { EventBasicInfo } from '../EventBasicInfo';
import { useEventDetailTabControl } from '../eventDetailTabControl';
import { EventKiosksTab } from '../EventKiosksTab';
import { EventStockListTab } from '../EventStock';
import { EventUiTab } from '../EventUiTab';
import { useEventDetailBreadcrumbs } from './useEventDetailBreadcrumbs';

import type { EventDetailTabId } from './types';


type DetailTabConfig = {
	id: EventDetailTabId,
	title: string,
	content: () => React.ReactNode,
};

const useEventDetailTabs = ({ event }: { event?: Event }) => {
	const { t: translate } = useTranslation('vending_machine');
	return useMemo<DetailTabConfig[]>(() => {
		if (!event) return [];
		return [
			{
				id: 'basicInfo',
				title: translate('events.tabs.basic_info'),
				content: () => <EventBasicInfo key={`basic-${event.id}`} event={event} />,
			},
			{
				id: 'ui',
				title: translate('events.tabs.ui'),
				content: () => <EventUiTab key={`ui-${event.id}`} event={event} />,
			},
			{
				id: 'products',
				title: translate('events.tabs.products'),
				content: () => (
					<EventStockListTab
						key={`prod-${event.id}`}
						event={event}
					/>
				),
			},
			{
				id: 'kiosks',
				title: translate('events.tabs.kiosks'),
				content: () => (
					<EventKiosksTab
						key={`kios-${event.id}`}
						event={event}
					/>
				),
			},
		];
	}, [event, translate]);
};

const useTabActions = ({ activeTab }: { activeTab: EventDetailTabId }): ControlPanelActionItem[] => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');
	const { registry } = useEventDetailTabControl();

	return useMemo<ControlPanelActionItem[]>(() => {
		const baseActions = [{
			label: translate('action.back'),
			onClick: () => navigate('../events'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		}];
		const tabActions = registry[activeTab]?.actions ?? [];
		return [...baseActions, ...tabActions];
	}, [translate, navigate, registry, activeTab]);
};

export const useEventDetailPageConfig = ({ event }: { event?: Event }) => {
	const [activeTab, setActiveTab] = useState<EventDetailTabId>('basicInfo');

	const onTabChange = useCallback((tab: string) => {
		setActiveTab(tab as EventDetailTabId);
	}, []);

	const breadcrumbs = useEventDetailBreadcrumbs({ event });
	const tabs = useEventDetailTabs({ event });
	const actions = useTabActions({ activeTab });

	return useMemo(
		() => ({ breadcrumbs, actions, tabs, activeTab, onTabChange }),
		[breadcrumbs, actions, tabs, activeTab, onTabChange],
	);
};
