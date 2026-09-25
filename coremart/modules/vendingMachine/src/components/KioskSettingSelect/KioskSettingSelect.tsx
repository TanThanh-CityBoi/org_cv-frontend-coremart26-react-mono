import { Box, Text } from '@mantine/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';


import { KioskSettingCard } from './KioskSettingCard';
import { KioskSettingSelectModal } from './KioskSettingSelectModal';

import type { KioskSetting } from '../../features/kioskSettings/types';


export interface KioskSettingSelectProps {
	isEditing: boolean;
	value: KioskSetting | null | undefined;
	onChange: (value: KioskSetting | undefined) => void;
	onRemove?: () => void;
	disabled?: boolean;
}

export const KioskSettingSelect: React.FC<KioskSettingSelectProps> = ({
	isEditing,
	value,
	onChange,
	onRemove,
	disabled = false,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const [modalOpened, setModalOpened] = useState(false);

	const handleSelect = (settings: KioskSetting[]) => {
		if (settings.length > 0) {
			onChange(settings[0]);
		}
		setModalOpened(false);
	};

	return (
		<Box>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('kiosk_settings.fields.settings')}
			</Text>
			<KioskSettingCard
				setting={value}
				isEditing={isEditing && !disabled}
				onSelect={() => !disabled && setModalOpened(true)}
				onRemove={isEditing && !disabled && onRemove ? onRemove : undefined}
			/>
			<KioskSettingSelectModal
				opened={modalOpened}
				onClose={() => setModalOpened(false)}
				onSelectSettings={handleSelect}
			/>
		</Box>
	);
};
