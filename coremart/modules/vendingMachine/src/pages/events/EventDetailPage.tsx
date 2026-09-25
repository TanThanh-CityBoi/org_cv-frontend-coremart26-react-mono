import { IconCalendarEvent } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import {
	EventDetailTabControlProvider,
	EventDetailTabId,
	EventNotFound,
	useEventDetail,
	useEventDetailPageConfig,
} from '@/features/events';


export const EventDetailPage: React.FC = () => {
	return (
		<EventDetailTabControlProvider>
			<EventDetailPageContent />
		</EventDetailTabControlProvider>
	);
};

const EventDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { event, isLoading } = useEventDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useEventDetailPageConfig({ event });

	return (
		<PageContainer
			documentTitle={event?.name ?? translate('coremart.vendingMachine.events.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[ <ControlPanel actions={actions} /> ]}
			isLoading={isLoading && !event}
			isNotFound={!isLoading && !event}
			notFoundContent={<EventNotFound />}
		>
			<DetailLayout
				header={{
					title: event?.name ?? '',
					subtitle: event?.code ?? '',
					avatar: <IconCalendarEvent size={40} stroke={1.5} />,
				}}
				syncWithUrl
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(value) => onTabChange(value as EventDetailTabId)}
			/>
		</PageContainer>
	);
};
