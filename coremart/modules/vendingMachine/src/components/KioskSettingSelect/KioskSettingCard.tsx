import { ActionIcon, Button, Card, Group, Stack, Tooltip, Text, Center, Box } from '@mantine/core';
import { IconAdjustments, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';

import type { KioskSetting } from '@/features/kioskSettings/types';


export interface KioskSettingCardProps {
	isEditing?: boolean;
	setting?: KioskSetting | null;
	onSelect?: () => void;
	onRemove?: () => void;
}

const EmptySettingCardContent: React.FC<{
	isEditing: boolean;
	onSelect: () => void;
}> = ({ isEditing, onSelect }) => {
	const { t: translate } = useTranslation();

	return (
		<Group gap='xs' justify='space-between'>
			<Group gap='xs' align='start'>
				<IconAdjustments size={30} color='var(--mantine-color-gray-7)' />
				<Text size='sm' c='dimmed'>
					{translate('coremart.vendingMachine.kioskSettings.selectSetting.empty')}
				</Text>
			</Group>
			{isEditing && (
				<Button size='xs' leftSection={<IconPlus size={14} />} onClick={onSelect}>
					{translate('coremart.vendingMachine.kioskSettings.selectSetting.selectButton')}
				</Button>
			)}
		</Group>
	);
};

const KioskSettingCardContent: React.FC<{
	setting: KioskSetting;
	isEditing: boolean;
	onRemove?: () => void;
}> = ({ setting, isEditing, onRemove }) => {
	const { t: translate } = useTranslation();
	const detailLabel = translate('nikki.general.actions.viewDetail');

	return (
		<Group gap='xs' justify='space-between' align='top'>
			<Group justify='space-between' align='flex-start'>
				<Center p={'xs'} bg={'gray.0'} bdrs={'sm'}>
					<IconAdjustments size={30} color='var(--mantine-color-gray-7)' />
				</Center>
				<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
					<Text size='sm' fw={500} lineClamp={2}>{setting.name}</Text>
					<Text size='xs' c='dimmed' lineClamp={1}>{setting.code}</Text>
					{setting.description ? (
						<Text size='xs' c='dimmed' lineClamp={2}>{setting.description}</Text>
					) : null}
					<ArchivedStatusBadge isArchived={Boolean(setting.isArchived)} />
				</Stack>
			</Group>

			<Box>
				{setting.id ? (
					<Tooltip label={detailLabel}>
						<ActionIcon
							variant='subtle'
							color='blue'
							size='sm'
							component={Link}
							to={`../kiosk-settings/${setting.id}`}
							aria-label={detailLabel}
						>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>
				) : null}
				{isEditing && onRemove ? (
					<Tooltip label={translate('nikki.general.actions.delete')}>
						<ActionIcon variant='subtle' color='red' size='sm' onClick={onRemove}>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				) : null}
			</Box>
		</Group>
	);
};


export const KioskSettingCard: React.FC<KioskSettingCardProps> = ({
	isEditing = false,
	setting,
	onSelect = () => {},
	onRemove,
}) => {
	return (
		<Card key={setting?.id ?? 'empty'} withBorder p='sm' radius='md'>
			{setting
				? <KioskSettingCardContent setting={setting} isEditing={isEditing} onRemove={onRemove} />
				: <EmptySettingCardContent isEditing={isEditing} onSelect={onSelect} />}
		</Card>
	);
};
