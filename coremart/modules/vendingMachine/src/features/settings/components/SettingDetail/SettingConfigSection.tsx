import {
	Box,
	Button,
	Group,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { SettingConfigRow } from '../../utils/settingConfigRows';


export interface SettingConfigSectionProps {
	mode: 'view' | 'edit' | 'create';
	configRows: SettingConfigRow[];
	onConfigRowsChange?: (rows: SettingConfigRow[]) => void;
}

export const SettingConfigSection: React.FC<SettingConfigSectionProps> = ({
	mode,
	configRows,
	onConfigRowsChange,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const isReadOnly = mode === 'view';

	const [newKey, setNewKey] = React.useState('');
	const [newValue, setNewValue] = React.useState('');

	React.useEffect(() => {
		if (isReadOnly) {
			setNewKey('');
			setNewValue('');
		}
	}, [isReadOnly]);

	const handleAddRow = () => {
		if (isReadOnly || !newKey.trim()) return;
		onConfigRowsChange?.([
			...configRows,
			{ key: newKey.trim(), value: newValue },
		]);
		setNewKey('');
		setNewValue('');
	};

	const handleRemoveRow = (index: number) => {
		if (isReadOnly) return;
		onConfigRowsChange?.(configRows.filter((_, i) => i !== index));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddRow();
		}
	};

	return (
		<Box>
			<Text size='sm' c='dimmed' mb={4} fw={500}>
				{translate('settings.fields.config')}
			</Text>

			{configRows.length > 0 ? (
				<Table striped highlightOnHover mb='md' withTableBorder withColumnBorders>
					<Table.Thead>
						<Table.Tr>
							<Table.Th style={{ width: '40%' }}>
								{translate('settings.config.key')}
							</Table.Th>
							<Table.Th>
								{translate('settings.config.value')}
							</Table.Th>
							{!isReadOnly && <Table.Th style={{ width: 50 }} />}
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{configRows.map((row, index) => (
							<Table.Tr key={`${row.key}-${index}`}>
								<Table.Td>
									<Text size='sm' fw={500}>{row.key}</Text>
								</Table.Td>
								<Table.Td>
									{isReadOnly
										? <Text size='sm'>{row.value}</Text>
										: (
											<TextInput
												size='xs'
												value={row.value}
												onChange={(e) => {
													const updated = [...configRows];
													updated[index] = { ...row, value: e.currentTarget.value };
													onConfigRowsChange?.(updated);
												}}
											/>
										)}
								</Table.Td>
								{!isReadOnly && (
									<Table.Td>
										<Button
											variant='subtle'
											color='red'
											size='xs'
											onClick={() => handleRemoveRow(index)}
											aria-label={translate('action.delete')}
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
				<Text size='sm' c='dimmed' mb='sm'>
					{/* {translate('settings.config.no_entries')} */}
				</Text>
			)}

			{!isReadOnly && (
				<Stack gap='xs'>
					<Group gap='xs' align='flex-end'>
						<TextInput
							placeholder={translate('settings.config.key')}
							value={newKey}
							onChange={(e) => setNewKey(e.currentTarget.value)}
							onKeyDown={handleKeyDown}
							style={{ flex: 1 }}
							size='sm'
						/>
						<TextInput
							placeholder={translate('settings.config.value')}
							value={newValue}
							onChange={(e) => setNewValue(e.currentTarget.value)}
							onKeyDown={handleKeyDown}
							style={{ flex: 2 }}
							size='sm'
						/>
						<Button
							onClick={handleAddRow}
							disabled={!newKey.trim()}
							size='sm'
						>
							{translate('action.add')}
						</Button>
					</Group>
				</Stack>
			)}
		</Box>
	);
};
