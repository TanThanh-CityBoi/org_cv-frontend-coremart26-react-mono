import { Badge, Box, Divider, Group, Stack, Text } from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { DetailControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { useThemeDetail } from '../../features/themes';
import { ThemePreview } from '../../features/themes/components/ThemePreview';


export const ThemeDetailPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const { id } = useParams<{ id: string }>();
	const { theme, isLoading } = useThemeDetail(id);

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string, label: string }> = {
			active: { color: 'green', label: translate('status.active') },
			inactive: { color: 'gray', label: translate('status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

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

	const breadcrumbs = [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('menu.themes'), href: '../themes' },
		{ title: theme?.name || translate('themes.detail.title'), href: '#' },
	];

	if (isLoading || !theme) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{translate('messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			actionBar={<DetailControlPanel
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Stack gap='md'>
				<Group gap='xs' mb='md'>
					<IconPalette size={20} />
					<Text fw={600} size='lg'>{theme.name}</Text>
				</Group>

				{/* Basic Info */}
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{theme.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.name')}
					</Text>
					<Text size='sm'>{theme.name}</Text>
				</div>

				{theme.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('themes.fields.description')}
							</Text>
							<Text size='sm'>{theme.description}</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.status')}
					</Text>
					{getStatusBadge(theme.status)}
				</div>

				<Divider />

				{/* Theme Configuration */}
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.primary_color')}
					</Text>
					<Group gap='xs'>
						<Box
							style={{
								width: 40,
								height: 40,
								borderRadius: 8,
								backgroundColor: theme.primaryColor,
								border: '2px solid #ddd',
							}}
						/>
						<Text size='sm'>{theme.primaryColor}</Text>
					</Group>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.product_card_style')}
					</Text>
					<Text size='sm'>
						{productCardStyleOptions.find(
							(opt) => opt.value === theme.productCardStyle)?.label || theme.productCardStyle}
					</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.app_background')}
					</Text>
					<Text size='sm'>
						{appBackgroundOptions.find(
							(opt) => opt.value === theme.appBackground)?.label || theme.appBackground}
					</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.font_style')}
					</Text>
					<Text size='sm'>
						{fontStyleOptions.find((opt) => opt.value === theme.fontStyle)?.label || theme.fontStyle}
					</Text>
				</div>

				{theme.mascotImage && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('themes.fields.mascot_image')}
							</Text>
							<Box
								style={{
									width: '100%',
									maxWidth: 200,
									height: 200,
									borderRadius: 8,
									overflow: 'hidden',
									border: '1px solid #ddd',
								}}
							>
								<img
									src={theme.mascotImage}
									alt='Mascot'
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
									}}
								/>
							</Box>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('themes.fields.created_at')}
					</Text>
					<Text size='sm'>{new Date(theme.createdAt).toLocaleString()}</Text>
				</div>

				<Divider />

				{/* Preview */}
				<Stack bg='var(--nikki-color-white)' p={16} justify='center' align='center'>
					<Text size='xs' c='dimmed'>
						{translate('themes.preview.title')}
					</Text>
					<ThemePreview theme={theme} />
				</Stack>

				<Divider />
				<Box h={100}></Box>
			</Stack>
		</PageContainer>
	);
};
