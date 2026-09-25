/* eslint-disable max-lines-per-function */
import { ActionIcon, Badge, Box, Card, Group, Stack, Tooltip, Text } from '@mantine/core';
import { IconEye, IconPalette, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Theme } from '../../features/themes/types';


export interface ThemePreviewCardProps {
	theme: Theme;
	isEditing?: boolean;
	onRemove?: () => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ theme, isEditing = false, onRemove }) => {
	const { t: translate } = useTranslation('vending_machine');
	const detailLabel = translate('action.viewDetails');

	const productCardStyleOptions = [
		{ value: 'default', label: translate('themes.product_card_style.default') },
		{ value: 'rounded', label: translate('themes.product_card_style.rounded') },
		{ value: 'minimal', label: translate('themes.product_card_style.minimal') },
		{ value: 'elegant', label: translate('themes.product_card_style.elegant') },
		{ value: 'modern', label: translate('themes.product_card_style.modern') },
	];

	const appBackgroundOptions = [
		{ value: 'none', label: translate('themes.app_background.none') },
		{ value: 'snow', label: translate('themes.app_background.snow') },
		{ value: 'fireworks', label: translate('themes.app_background.fireworks') },
		{ value: 'particles', label: translate('themes.app_background.particles') },
		{ value: 'gradient', label: translate('themes.app_background.gradient') },
		{ value: 'custom', label: translate('themes.app_background.custom') },
	];

	const fontStyleOptions = [
		{ value: 'default', label: translate('themes.font_style.default') },
		{ value: 'roboto', label: translate('themes.font_style.roboto') },
		{ value: 'inter', label: translate('themes.font_style.inter') },
		{ value: 'poppins', label: translate('themes.font_style.poppins') },
		{ value: 'montserrat', label: translate('themes.font_style.montserrat') },
		{ value: 'custom', label: translate('themes.font_style.custom') },
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
							<Tooltip label={translate('action.delete')}>
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
						<Text size='xs' c='dimmed'>{translate('themes.fields.primary_color')}:</Text>
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
						{translate('themes.fields.product_card_style')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{productCardStyleOptions.find(
							(opt) => opt.value === theme.productCardStyle)?.label || theme.productCardStyle}
					</Badge>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('themes.fields.app_background')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{appBackgroundOptions.find(
							(opt) => opt.value === theme.appBackground)?.label || theme.appBackground}
					</Badge>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{translate('themes.fields.font_style')}:
					</Text>
					<Badge size='xs' variant='filled'>
						{fontStyleOptions.find((opt) => opt.value === theme.fontStyle)?.label || theme.fontStyle}
					</Badge>
				</Group>
			</Stack>
		</Card>
	);
};
