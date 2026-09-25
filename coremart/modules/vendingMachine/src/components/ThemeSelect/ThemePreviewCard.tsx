/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Box, Card, Group, Stack, Tooltip, Text } from '@mantine/core';
import { IconEye, IconPalette, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Theme } from '@/features/themes/types';


export interface ThemePreviewCardProps {
	theme: Theme;
	isEditing?: boolean;
	onRemove?: () => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ theme, isEditing = false, onRemove }) => {
	const { t: translate } = useTranslation();
	const detailLabel = translate('nikki.general.actions.viewDetail');

	const productCardStyleOptions = [
		{ value: 'default', label: translate('coremart.vendingMachine.themes.productCardStyle.default') },
		{ value: 'rounded', label: translate('coremart.vendingMachine.themes.productCardStyle.rounded') },
		{ value: 'minimal', label: translate('coremart.vendingMachine.themes.productCardStyle.minimal') },
		{ value: 'elegant', label: translate('coremart.vendingMachine.themes.productCardStyle.elegant') },
		{ value: 'modern', label: translate('coremart.vendingMachine.themes.productCardStyle.modern') },
	];

	const appBackgroundOptions = [
		{ value: 'none', label: translate('coremart.vendingMachine.themes.appBackground.none') },
		{ value: 'snow', label: translate('coremart.vendingMachine.themes.appBackground.snow') },
		{ value: 'fireworks', label: translate('coremart.vendingMachine.themes.appBackground.fireworks') },
		{ value: 'particles', label: translate('coremart.vendingMachine.themes.appBackground.particles') },
		{ value: 'gradient', label: translate('coremart.vendingMachine.themes.appBackground.gradient') },
		{ value: 'custom', label: translate('coremart.vendingMachine.themes.appBackground.custom') },
	];

	const fontStyleOptions = [
		{ value: 'default', label: translate('coremart.vendingMachine.themes.fontStyle.default') },
		{ value: 'roboto', label: translate('coremart.vendingMachine.themes.fontStyle.roboto') },
		{ value: 'inter', label: translate('coremart.vendingMachine.themes.fontStyle.inter') },
		{ value: 'poppins', label: translate('coremart.vendingMachine.themes.fontStyle.poppins') },
		{ value: 'montserrat', label: translate('coremart.vendingMachine.themes.fontStyle.montserrat') },
		{ value: 'custom', label: translate('coremart.vendingMachine.themes.fontStyle.custom') },
	];

	return (
		<Card withBorder p='md' radius='md'>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconPalette size={24} />
						<Stack gap={2}>
							<Text size='sm' fw={600}>{theme.name}</Text>
							<Badge size='sm' variant='filled'>{theme.code}</Badge>
						</Stack>
					</Group>
					<Group gap={4}>
						{theme.id ? (
							<Tooltip label={detailLabel}>
								<ActionIcon
									variant='subtle'
									color='blue'
									size='sm'
									aria-label={detailLabel}
									component={Link}
									to={`../themes/${theme.id}`}
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
					</Group>
				</Group>

				{theme.description && (
					<Text size='xs' c='dimmed' lineClamp={2}>
						{theme.description}
					</Text>
				)}

				<Group gap='xs' wrap='wrap'>
					<Badge size='sm' variant='filled' color={theme.status === 'active' ? 'green' : 'gray'}>
						{theme.status}
					</Badge>
					<Group gap={4}>
						<Text size='xs' c='dimmed'>{translate('coremart.vendingMachine.themes.fields.primaryColor')}:</Text>
						<Box
							w={20}
							h={20}
							style={{
								backgroundColor: theme.primaryColor,
								borderRadius: 4,
								border: '1px solid #ddd',
							}}
						/>
					</Group>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('coremart.vendingMachine.themes.fields.productCardStyle')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{productCardStyleOptions.find(
							(opt) => opt.value === theme.productCardStyle)?.label || theme.productCardStyle}
					</Badge>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('coremart.vendingMachine.themes.fields.appBackground')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{appBackgroundOptions.find(
							(opt) => opt.value === theme.appBackground)?.label || theme.appBackground}
					</Badge>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('coremart.vendingMachine.themes.fields.fontStyle')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{fontStyleOptions.find((opt) => opt.value === theme.fontStyle)?.label || theme.fontStyle}
					</Badge>
				</Group>
			</Stack>
		</Card>
	);
};
