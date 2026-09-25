import { Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CardActionMenu } from '../../../../components';
import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { TablePagination } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';
import { Setting } from '../../types';
import { getSettingTableActions, type SettingTableActions } from '../SettingTable';


type SettingGridCardProps = {
	setting: Setting,
	cardActions: SettingTableActions,
	onPreview?: (setting: Setting) => void,
	translate: TFunction,
};

function SettingGridCard({ setting, cardActions, onPreview, translate }: SettingGridCardProps) {
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
						<IconSettings size={20} />
						<Stack gap={0}>
							<Text fw={600} size='sm'>{setting.code}</Text>
							<Text size='xs' c='dimmed'>{setting.name}</Text>
						</Stack>
					</Group>
					<Group gap='xs' onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
						<CardActionMenu
							items={getSettingTableActions(setting, cardActions, translate)}
							contextMenuContainerRef={cardRef}
						/>
					</Group>
				</Group>

				{setting.description && (
					<Text size='xs' c='dimmed' lineClamp={3}>
						{setting.description}
					</Text>
				)}

				<Group gap='xs'>
					<ArchivedStatusBadge isArchived={!!setting.isArchived} />
				</Group>

				<Text size='xs' c='dimmed'>
					{translate('settings.fields.created_at')}: {new Date(setting.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
}

export interface SettingGridViewProps {
	settings: Setting[];
	isLoading?: boolean;
	actions?: SettingTableActions;
	pagination?: TablePaginationProps;
}

export const SettingGridView: React.FC<SettingGridViewProps> = ({
	settings,
	isLoading = false,
	actions = {},
	pagination,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const { preview: onPreview, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('messages.loading')}</Text>;
	}

	if (settings.length === 0) {
		return <Text c='dimmed'>{translate('settings.messages.no_settings')}</Text>;
	}

	return (
		<Stack gap='md'>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
			>
				{settings.map((setting) => (
					<SettingGridCard
						key={setting.id}
						setting={setting}
						cardActions={cardActions}
						onPreview={onPreview}
						translate={translate}
					/>
				))}
			</SimpleGrid>
			{pagination && <TablePagination {...pagination} />}
		</Stack>
	);
};
