import { Box, Select, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { UIMode } from '../../features/kiosks/types';


export interface UIModeSelectProps {
	value: UIMode | null | undefined;
	onChange: (value: UIMode | undefined) => void;
	isEditing: boolean;
	disabled: boolean;
}

export const UIModeSelect: React.FC<UIModeSelectProps> = ({
	value,
	onChange,
	isEditing,
	disabled,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	return (
		<Box>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('kiosk_models.fields.interface_mode')}
			</Text>
			<Select
				value={value ?? null}
				onChange={(v) => onChange(v === null ? undefined : (v as UIMode))}
				placeholder={translate('kiosk_models.fields.interface_mode')}
				data={[
					{ value: UIMode.NORMAL, label: translate('kiosk_models.interface_mode.normal') },
					{ value: UIMode.FOCUS, label: translate('kiosk_models.interface_mode.focus') },
				]}
				clearable
				readOnly={!isEditing}
				disabled={disabled}
			/>
		</Box>
	);
};
