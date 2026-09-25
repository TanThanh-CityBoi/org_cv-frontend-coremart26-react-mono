/* eslint-disable max-lines-per-function */
import { Box, Input, Select, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { KioskType } from '@/features/kioskModels';
import { getKioskTypeLabel } from '@/features/kioskModels/components/KioskModelDetail';
import { ShelvesConfig } from '@/features/kioskModels/components/ShelvesConfig';

import { useKioskOperationalSettingTab } from './hooks';

import type { Kiosk } from '../../types';




export interface KioskOperationalSettingsProps {
	kiosk: Kiosk;
}

export const KioskOperationalSettings: React.FC<KioskOperationalSettingsProps> = ({ kiosk }) => {
	const { t: translate } = useTranslation();
	const {
		isEditing, goodsCollectorType, setGoodsCollectorType,
		shelvesNumber, setShelvesNumber, shelvesConfigRows, setShelvesConfigRows,
	} = useKioskOperationalSettingTab({ kiosk });

	return (
		<Stack gap='lg'>
			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.kioskType')}
				</Text>
				{isEditing ? (
					<Select
						value={goodsCollectorType || null}
						onChange={(value) => setGoodsCollectorType(value as KioskType | null)}
						placeholder={translate('coremart.vendingMachine.kioskModels.fields.kioskType')}
						data={[
							{ value: 'non-elevator', label: translate('coremart.vendingMachine.kioskModels.kioskType.nonElevator') },
							{ value: 'elevator', label: translate('coremart.vendingMachine.kioskModels.kioskType.elevator') },
						]}
						clearable
					/>
				) : (
					<Box p='xs' style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-sm)' }}>
						<Text size='sm'>{getKioskTypeLabel(goodsCollectorType || undefined, translate)}</Text>
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

			{/* ===== */}

			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.maxCartItem', {defaultValue: 'Thời gian chuyển sang màn hình chờ'})}
				</Text>
				<Input type='number' />
			</Box>
			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.maxCartItem', {defaultValue: 'Thời gian chờ khách lấy hàng'})}
				</Text>
				<Input type='number' />
			</Box>
			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.maxCartItem', {defaultValue: 'Thời gian chờ chuyển về màn hình chính sau khi lấy hàng xong'})}
				</Text>
				<Input type='number' />
			</Box>

			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.maxCartItem', {defaultValue: 'Số sản phẩm mua tối đa / lần'})}
				</Text>
				<Input type='number' />
			</Box>

			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.maxCartItem', {defaultValue: 'Số lần thử lại tối đa trên một vị trí ( đối với lò xo)'})}
				</Text>
				<Input type='number' />
			</Box>
			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.maxCartItem', {defaultValue: 'Số vị trí lấy hàng thất bại tối đa'})}
				</Text>
				<Input type='number' />
			</Box>
			<Box>
				<Text size='sm' c='dimmed' mb={2} fw={500}>
					{translate('coremart.vendingMachine.kioskModels.fields.maxCartItem', {defaultValue: 'Số vị trí lấy hàng thất bại tối đa do cảm biến rơi'})}
				</Text>
				<Input type='number' />
			</Box>
		</Stack>
	);
};
