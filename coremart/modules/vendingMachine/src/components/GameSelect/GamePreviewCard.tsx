import { ActionIcon, Badge, Card, Group, Stack, Tooltip, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Game } from '../../features/games/types';


export interface GamePreviewCardProps {
	game: Game;
	isEditing?: boolean;
	onRemove?: () => void;
}

export const GamePreviewCard: React.FC<GamePreviewCardProps> = ({ game, isEditing = false, onRemove }) => {
	const { t: translate } = useTranslation('vending_machine');
	const detailLabel = translate('action.viewDetails');

	return (
		<Card withBorder p='md' radius='md'>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconDeviceGamepad2 size={24} />
						<Stack gap={2}>
							<Text size='sm' fw={600}>{game.name}</Text>
							<Badge size='sm' variant='filled'>{game.code}</Badge>
						</Stack>
					</Group>
					<Group gap={4}>
						{game.id ? (
							<Tooltip label={detailLabel}>
								<ActionIcon
									variant='subtle'
									color='blue'
									size='sm'
									aria-label={detailLabel}
									component={Link}
									to={`../games/${game.id}`}
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

				{game.description && (
					<Text size='xs' c='dimmed' lineClamp={2}>
						{game.description}
					</Text>
				)}

				<Group gap='xs' wrap='wrap'>
					<Badge size='sm' variant='filled' color={game.status === 'active' ? 'green' : 'gray'}>
						{game.status}
					</Badge>
					<Text size='xs' c='dimmed'>
						{translate('games.fields.latest_version')}: {game.latestVersion}
					</Text>
				</Group>
			</Stack>
		</Card>
	);
};
