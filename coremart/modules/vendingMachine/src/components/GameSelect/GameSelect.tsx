import { Button, Card, Group, Text } from '@mantine/core';
import { IconDeviceGamepad2, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GamePreviewCard } from './GamePreviewCard';
import { GameSelectModal } from './GameSelectModal';

import type { Game } from '../../features/games/types';


export interface GameSelectProps {
	isEditing: boolean;
	value: Game | null | undefined;
	onChange: (value: Game | undefined) => void;
	onRemove?: () => void;
}

export const GameSelect: React.FC<GameSelectProps> = ({
	value,
	onChange,
	onRemove,
	isEditing,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const [modalOpened, setModalOpened] = useState(false);

	return (
		<div>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('events.fields.game')}
			</Text>
			{value ? (
				<GamePreviewCard
					game={value}
					isEditing={isEditing}
					onRemove={isEditing && onRemove ? onRemove : undefined}
				/>
			) : (
				<Card withBorder p='md' radius='md'>
					<Group gap='xs' justify='space-between'>
						<Group gap='xs'>
							<IconDeviceGamepad2 size={30} color='var(--mantine-color-gray-7)' />
							<Text size='sm' c='dimmed'>
								{translate('events.messages.no_game')}
							</Text>
						</Group>
						{isEditing && (
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setModalOpened(true)}
							>
								{translate('events.select_game.select_game')}
							</Button>
						)}
					</Group>
				</Card>
			)}

			<GameSelectModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSelectGame={(game) => {
					onChange(game);
					setModalOpened(false);
				}}
			/>
		</div>
	);
};
