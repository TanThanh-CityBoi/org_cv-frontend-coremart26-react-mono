import { IconDeviceTabletCog } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import {
	KioskSettingDetailTabControlProvider,
	KioskSettingNotFound,
	useKioskSettingDetail,
	useKioskSettingDetailPageConfig,
} from '@/features/kioskSettings';


export const KioskSettingDetailPage: React.FC = () => {
	return (
		<KioskSettingDetailTabControlProvider>
			<KioskSettingDetailPageContent />
		</KioskSettingDetailTabControlProvider>
	);
};

const KioskSettingDetailPageContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation();
	const { setting, isLoading } = useKioskSettingDetail(id);
	const { breadcrumbs, actions, tabs, activeTab, onTabChange } = useKioskSettingDetailPageConfig({ setting });

	return (
		<PageContainer
			documentTitle={setting?.name ?? translate('coremart.vendingMachine.kioskSettings.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='kiosk-setting-detail-control' actions={actions} />]}
			isLoading={isLoading && !setting}
			isNotFound={!isLoading && !setting}
			notFoundContent={<KioskSettingNotFound />}
		>
			<DetailLayout
				header={{
					title: setting?.name ?? '',
					subtitle: setting?.code ?? '',
					avatar: <IconDeviceTabletCog size={42} stroke={1.25} />,
				}}
				syncWithUrl
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={onTabChange}
			/>
		</PageContainer>
	);
};
