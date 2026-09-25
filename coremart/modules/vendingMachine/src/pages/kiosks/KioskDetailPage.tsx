import { Text } from '@mantine/core';
import { Group } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '../../components';
import { DetailLayout } from '../../components/DetailLayout';
import { KioskConnectionStatus } from '../../components/KioskConnectionStatus';
import { PageContainer } from '../../components/PageContainer';
import { useKioskDetail } from '../../features/kiosks';
import { useKioskDetailPageConfig,
	KioskDetailTabControlProvider, KioskNotFound,
} from '../../features/kiosks/components/KioskDetail';
import { KioskDetailTabs } from '../../features/kiosks/components/KioskDetail/hooks/types';



export const KioskDetailPage: React.FC = () => {
	return (
		<KioskDetailTabControlProvider>
			<KioskDetailPageContent />
		</KioskDetailTabControlProvider>
	);
};

const KioskDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation('vending_machine');
	const { kiosk, isLoading } = useKioskDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useKioskDetailPageConfig({ kiosk });

	const HeaderName = () => {
		return (
			<Group mb={3}>
				<Text fw={600} size='lg' lh={1}>{kiosk?.name}</Text>
				<KioskConnectionStatus connections={kiosk?.connection?.history ?? []} />
			</Group>
		);
	};

	return (
		<PageContainer
			documentTitle={kiosk?.name ?? translate('kiosk.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[ <ControlPanel actions={actions} /> ]}
			isLoading={isLoading && !kiosk}
			isNotFound={!isLoading && !kiosk}
			notFoundContent={<KioskNotFound />}
		>
			<DetailLayout
				header={{
					title: <HeaderName />,
					subtitle: kiosk?.code || '',
				}}
				syncWithUrl
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(value) => onTabChange(value as KioskDetailTabs)}
			/>
		</PageContainer>
	);
};
