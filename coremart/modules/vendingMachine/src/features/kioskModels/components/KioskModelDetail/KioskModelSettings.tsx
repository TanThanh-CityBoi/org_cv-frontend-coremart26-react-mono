import { Box, Select, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ShelvesConfig } from '../ShelvesConfig';
import { useModelSettingsTab } from './hooks/useModelSettingsTab';

import type { KioskModel, KioskType } from '../../types';


export interface KioskModelSettingsProps {
	model: KioskModel;
}

export function getKioskTypeLabel(type: KioskType | undefined, translate: (key: string) => string) {
	if (!type) return '-';
	const labelMap: Record<KioskType, string> = {
		'elevator': translate('kiosk_models.kiosk_type.elevator'),
		'non-elevator': translate('kiosk_models.kiosk_type.non_elevator'),
	};
	return labelMap[type] || type;
};

export const KioskModelSettings: React.FC<KioskModelSettingsProps> = ({ model }) => {
	const { t: translate } = useTranslation('vending_machine');
	const {
		isEditing, selectedGoodsCollectorType, setSelectedGoodsCollectorType,
		shelvesNumber, setShelvesNumber, shelvesConfigRows, setShelvesConfigRows,
	} = useModelSettingsTab({ model });

	return (
		<Stack gap='lg'>
			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('kiosk_models.fields.kiosk_type')}
				</Text>
				{isEditing ? (
					<Select
						value={selectedGoodsCollectorType || null}
						onChange={(value) => setSelectedGoodsCollectorType(value as KioskType | undefined)}
						placeholder={translate('kiosk_models.fields.kiosk_type')}
						data={[
							{ value: 'non-elevator', label: translate('kiosk_models.kiosk_type.non_elevator') },
							{ value: 'elevator', label: translate('kiosk_models.kiosk_type.elevator') },
						]}
						clearable
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getKioskTypeLabel(selectedGoodsCollectorType, translate)}</Text>
					</Box>
				)}
			</Box>

			<ShelvesConfig
				isEditing={isEditing}
				shelvesNumber={shelvesNumber}
				shelvesConfigRows={shelvesConfigRows}
				onShelvesNumberChange={setShelvesNumber}
				onShelvesConfigRowsChange={setShelvesConfigRows}
			/>
		</Stack>
	);
};
