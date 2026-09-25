import { Button, Card, Group, Text } from '@mantine/core';
import { IconPalette, IconPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemePreviewCard } from './ThemePreviewCard';
import { ThemeSelectModal } from './ThemeSelectModal';

import type { Theme } from '../../features/themes/types';


export interface ThemeSelectProps {
	isEditing: boolean;
	value: Theme | null | undefined;
	onChange: (value: Theme | undefined) => void;
	onRemove?: () => void;
}

export const ThemeSelect: React.FC<ThemeSelectProps> = ({
	isEditing,
	value,
	onChange,
	onRemove,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const [modalOpened, setModalOpened] = useState(false);

	return (
		<div>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('events.fields.theme')}
			</Text>
			{value ? (
				<ThemePreviewCard
					theme={value}
					isEditing={isEditing}
					onRemove={isEditing && onRemove ? onRemove : undefined}
				/>
			) : (
				<Card withBorder p='md' radius='md'>
					<Group gap='xs' justify='space-between'>
						<Group gap='xs'>
							<IconPalette size={30} color='var(--mantine-color-gray-7)' />
							<Text size='sm' c='dimmed'>
								{translate('events.messages.no_theme')}
							</Text>
						</Group>
						{isEditing && (
							<Button
								size='xs'
								leftSection={<IconPlus size={14} />}
								onClick={() => setModalOpened(true)}
							>
								{translate('events.select_theme.select_theme')}
							</Button>
						)}
					</Group>
				</Card>
			)}

			<ThemeSelectModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSelectTheme={(theme) => {
					onChange(theme);
					setModalOpened(false);
				}}
			/>
		</div>
	);
};
