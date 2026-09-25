import { Badge, Group, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '../../components';
import { DetailLayout } from '../../components/DetailLayout';
import { PageContainer } from '../../components/PageContainer';
import { useSettingDetail } from '../../features/settings';
import {
	SettingBasicInfo,
	SettingNotFound,
	useSettingDetailPageConfig,
} from '../../features/settings/components/SettingDetail';
import { Setting } from '../../features/settings/types';


function SettingDetailHeader({ setting, translate }: { setting: Setting, translate: (key: string) => string }) {
	return (
		<Group gap='xs' align='center'>
			<Text fw={600} size='lg' lh={1}>{setting.name}</Text>
			<Badge color={setting.isArchived ? 'gray' : 'green'} variant='light' size='sm'>
				{setting.isArchived
					? translate('status.archived')
					: translate('status.active')}
			</Badge>
		</Group>
	);
}

export const SettingDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t: translate } = useTranslation('vending_machine');
	const { setting, isLoading } = useSettingDetail(id);
	const { breadcrumbs, actions, formProps } = useSettingDetailPageConfig({ setting });

	return (
		<PageContainer
			documentTitle={setting?.name ?? translate('settings.detail.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel actions={actions} />]}
			isLoading={isLoading && !setting}
			isNotFound={!setting && !isLoading}
			notFoundContent={<SettingNotFound />}
		>
			<DetailLayout
				header={{
					title: setting
						? <SettingDetailHeader setting={setting} translate={translate} />
						: '',
					subtitle: setting?.code || '',
					avatar: <IconSettings size={46} />,
				}}
				sections={[<SettingBasicInfo setting={setting!} formProps={formProps} />]}
			/>
		</PageContainer>
	);
};
