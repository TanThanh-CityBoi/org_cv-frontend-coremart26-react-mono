import { Button, Group, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KioskDevice, KioskDeviceSpecification } from '../../types';
import { useSpecificationsTab } from './hooks/useSpecificationsTab';


export interface KioskDeviceSpecificationsProps {
	kioskDevice: KioskDevice;
}

export const KioskDeviceSpecifications: React.FC<KioskDeviceSpecificationsProps> = ({ kioskDevice }) => {
	const { t: translate } = useTranslation('vending_machine');
	const { isEditing } = useSpecificationsTab({ kioskDevice });

	const [specifications, setSpecifications] = useState<KioskDeviceSpecification[]>(kioskDevice?.specifications || []);
	const [newSpecKey, setNewSpecKey] = useState('');
	const [newSpecValue, setNewSpecValue] = useState('');

	useEffect(() => {
		if (kioskDevice) {
			setSpecifications(kioskDevice.specifications || []);
		}
	}, [kioskDevice]);

	const handleAddSpecification = useCallback(() => {
		if (newSpecKey.trim() && newSpecValue.trim()) {
			setSpecifications((prev) => [...prev, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
			setNewSpecKey('');
			setNewSpecValue('');
		}
	}, [newSpecKey, newSpecValue]);

	const handleRemoveSpecification = useCallback((index: number) => {
		setSpecifications((prev) => prev.filter((_, i) => i !== index));
	}, []);

	return (
		<Stack gap='lg'>
			<div>
				<Text size='sm' c='dimmed' mb='xs' fw={500}>
					{translate('device.fields.specifications')}
				</Text>

				{specifications.length > 0 ? (
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{translate('device.fields.spec_key')}</Table.Th>
								<Table.Th>{translate('device.fields.spec_value')}</Table.Th>
								{isEditing && <Table.Th style={{ width: 50 }} />}
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{specifications.map((spec, index) => (
								<Table.Tr key={index}>
									<Table.Td>{spec.key}</Table.Td>
									<Table.Td>{spec.value}</Table.Td>
									{isEditing && (
										<Table.Td>
											<Button
												variant='subtle'
												color='red'
												size='xs'
												onClick={() => handleRemoveSpecification(index)}
											>
												<IconTrash size={14} />
											</Button>
										</Table.Td>
									)}
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				) : (
					<Text size='sm' c='dimmed'>
						{translate('device.messages.no_specifications')}
					</Text>
				)}

				{isEditing && (
					<Stack gap='xs' mt='md'>
						<Group gap='xs' align='flex-end'>
							<TextInput
								placeholder={translate('device.fields.spec_key')}
								value={newSpecKey}
								onChange={(e) => setNewSpecKey(e.currentTarget.value)}
								style={{ flex: 1 }}
							/>
							<TextInput
								placeholder={translate('device.fields.spec_value')}
								value={newSpecValue}
								onChange={(e) => setNewSpecValue(e.currentTarget.value)}
								style={{ flex: 1 }}
							/>
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={handleAddSpecification}
								disabled={!newSpecKey.trim() || !newSpecValue.trim()}
							>
								{translate('action.add')}
							</Button>
						</Group>
					</Stack>
				)}
			</div>
		</Stack>
	);
};
