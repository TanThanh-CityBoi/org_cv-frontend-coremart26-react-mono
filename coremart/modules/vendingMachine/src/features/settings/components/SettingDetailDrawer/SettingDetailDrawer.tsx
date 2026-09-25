import { Badge, Code, Divider, Stack, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PreviewDrawer } from '../../../../components/PreviewDrawer';
import { Setting } from '../../types';


export interface SettingDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	setting: Setting | undefined;
	isLoading?: boolean;
}

export const SettingDetailDrawer: React.FC<SettingDetailDrawerProps> = ({
	opened,
	onClose,
	setting,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: setting?.name,
				subtitle: setting?.code,
				avatar: <IconSettings size={20} />,
			}}
			onViewDetails={() => {
				if (setting?.id) {
					navigate(`../settings/${setting.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!setting && !isLoading}
			drawerProps={{ size: 'lg', opened, onClose }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('settings.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{setting?.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('settings.fields.name')}
					</Text>
					<Text size='sm'>{setting?.name}</Text>
				</div>

				{setting?.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('settings.fields.description')}
							</Text>
							<Text size='sm'>{setting.description}</Text>
						</div>
					</>
				)}

				{setting?.config && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('settings.fields.config')}
							</Text>
							<Code block>{JSON.stringify(setting.config, null, 2)}</Code>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('settings.fields.is_archived')}
					</Text>
					{setting
						? (
							<Badge color={setting.isArchived ? 'gray' : 'green'} size='sm'>
								{setting.isArchived
									? translate('status.archived')
									: translate('status.active')}
							</Badge>
						)
						: null}
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('settings.fields.created_at')}
					</Text>
					<Text size='sm'>{setting?.createdAt ? new Date(setting.createdAt).toLocaleString() : '—'}</Text>
				</div>

				{setting?.updatedAt && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('settings.fields.updated_at')}
							</Text>
							<Text size='sm'>{new Date(setting.updatedAt).toLocaleString()}</Text>
						</div>
					</>
				)}
			</Stack>
		</PreviewDrawer>
	);
};
