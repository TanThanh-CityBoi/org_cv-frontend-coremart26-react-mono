import { Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconBox } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CardActionMenu } from '../../../../components';
import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { TablePagination } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';
import { KioskModel } from '../../types';
import { getKioskModelTableActions, type KioskModelTableActions } from '../KioskModelTable';


type KioskModelGridCardProps = {
	model: KioskModel,
	cardActions: KioskModelTableActions,
	onPreview?: (model: KioskModel) => void,
	translate: TFunction,
};

function KioskModelGridCard({ model, cardActions, onPreview, translate }: KioskModelGridCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	return (
		<Card
			ref={cardRef}
			shadow='sm'
			padding='lg'
			radius='md'
			withBorder
			pos='relative'
			style={{
				cursor: model.isArchived ? 'default' : 'pointer',
			}}
			onClick={() => {
				if (!model.isArchived) onPreview?.(model);
			}}
		>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconBox size={20} />
						<Stack gap={0}>
							<Text fw={600} size='sm'>{model.referenceCode}</Text>
							<Text size='xs' c='dimmed'>{model.name}</Text>
						</Stack>
					</Group>
					<Group gap='xs' onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}>
						<CardActionMenu
							items={getKioskModelTableActions(model, cardActions, translate)}
							contextMenuContainerRef={cardRef}
						/>
					</Group>
				</Group>

				{model.description && (
					<Text size='xs' c='dimmed' lineClamp={3}>
						{model.description}
					</Text>
				)}

				<Group gap='xs' wrap='nowrap'>
					<ArchivedStatusBadge isArchived={model.isArchived ?? false} />
				</Group>

				<Text size='xs' c='dimmed'>
					{translate('kiosk_models.fields.created_at')}: {new Date(model.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
}

export interface KioskModelGridViewProps {
	models: KioskModel[];
	isLoading?: boolean;
	actions?: KioskModelTableActions;
	pagination?: TablePaginationProps;
}

export const KioskModelGridView: React.FC<KioskModelGridViewProps> = ({
	models,
	isLoading = false,
	actions = {},
	pagination,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const { preview: onPreview, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('messages.loading')}</Text>;
	}

	if (models.length === 0) {
		return <Text c='dimmed'>{translate('kiosk_models.messages.no_models')}</Text>;
	}

	return (
		<Stack gap='md' mih={150}>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
			>
				{models.map((model) => (
					<KioskModelGridCard
						key={model.id}
						model={model}
						cardActions={cardActions}
						onPreview={onPreview}
						translate={translate}
					/>
				))}
			</SimpleGrid>
			{pagination ? <TablePagination {...pagination} /> : null}
		</Stack>
	);
};
