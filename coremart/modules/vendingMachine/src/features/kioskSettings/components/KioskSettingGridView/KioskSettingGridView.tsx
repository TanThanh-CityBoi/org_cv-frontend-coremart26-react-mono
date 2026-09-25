import { Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconSettings2 } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CardActionMenu } from '../../../../components';
import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { TablePagination } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';
import { KioskSetting } from '../../types';
import { getKioskSettingTableActions, type KioskSettingTableActions } from '../KioskSettingTable';


type KioskSettingGridCardProps = {
	setting: KioskSetting,
	cardActions: KioskSettingTableActions,
	onPreview?: (setting: KioskSetting) => void,
	translate: TFunction,
};

function KioskSettingGridCard({ setting, cardActions, onPreview, translate }: KioskSettingGridCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	return (
		<Card
			ref={cardRef}
			shadow='sm'
			padding='lg'
			radius='md'
			withBorder
			pos='relative'
			style={{ cursor: 'pointer' }}
			onClick={() => onPreview?.(setting)}
		>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconSettings2 size={20} />
						<Stack gap={0}>
							<Text fw={600} size='sm'>{setting.code}</Text>
							<Text size='xs' c='dimmed'>{setting.name}</Text>
						</Stack>
					</Group>
					<Group gap='xs' onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}>
						<CardActionMenu
							items={getKioskSettingTableActions(setting, cardActions, translate)}
							contextMenuContainerRef={cardRef}
						/>
					</Group>
				</Group>

				{setting.description && (
					<Text size='xs' c='dimmed' lineClamp={3}>{setting.description}</Text>
				)}

				{setting.kiosks && setting.kiosks.length > 0 && (
					<Text size='xs' c='dimmed'>
						{translate('kiosk_settings.fields.kiosks')}: {setting.kiosks.length}
					</Text>
				)}
				{setting.themeSetting && (
					<Text size='xs' c='dimmed'>
						{translate('kiosk_settings.fields.theme')}: {setting.themeSetting.name}
					</Text>
				)}
				{setting.gameSetting && (
					<Text size='xs' c='dimmed'>
						{translate('kiosk_settings.fields.game')}: {setting.gameSetting.name}
					</Text>
				)}

				<Group gap='xs' wrap='nowrap'>
					<ArchivedStatusBadge isArchived={!!setting.isArchived} />
				</Group>

				<Text size='xs' c='dimmed'>
					{translate('kiosk_settings.fields.created_at')}: {new Date(setting.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
}

export interface KioskSettingGridViewProps {
	settings: KioskSetting[];
	isLoading?: boolean;
	actions?: KioskSettingTableActions;
	pagination?: TablePaginationProps;
}

export const KioskSettingGridView: React.FC<KioskSettingGridViewProps> = ({
	settings,
	isLoading = false,
	actions = {},
	pagination,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const { preview: onPreview, ...cardActions } = actions;
	const resolvedPagination = pagination;

	if (isLoading) {
		return <Text c='dimmed'>{translate('messages.loading')}</Text>;
	}

	if (settings.length === 0) {
		return <Text c='dimmed'>{translate('kiosk_settings.messages.no_settings')}</Text>;
	}

	return (
		<Stack gap='md' pos='relative' mih={200}>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}>
				{settings.map((setting) => (
					<KioskSettingGridCard
						key={setting.id}
						setting={setting}
						cardActions={cardActions}
						onPreview={onPreview}
						translate={translate}
					/>
				))}
			</SimpleGrid>
			{resolvedPagination ? <TablePagination {...resolvedPagination} /> : null}
		</Stack>
	);
};
