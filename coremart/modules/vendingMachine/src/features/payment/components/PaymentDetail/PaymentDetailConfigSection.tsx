/* eslint-disable max-lines-per-function */
import {
	Badge,
	Box,
	Button,
	Group,
	Select,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	paymentConfigToRows,
	type PaymentConfigRow,
} from '../../utils/paymentConfigRows';

import type { CustomFieldValueType, PaymentMethod } from '../../types';


export interface PaymentDetailConfigSectionProps {
	mode: 'view' | 'edit';
	config: PaymentMethod['config'];
	configRows: PaymentConfigRow[];
	onConfigRowsChange: (rows: PaymentConfigRow[]) => void;
}

function renderStoredValue(valueType: CustomFieldValueType, value: string): string {
	if (valueType === 'password') {
		return '••••••••';
	}
	return value;
}

export const PaymentDetailConfigSection: React.FC<PaymentDetailConfigSectionProps> = ({
	mode,
	config,
	configRows,
	onConfigRowsChange,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const isReadOnly = mode === 'view';
	const rows = isReadOnly ? paymentConfigToRows(config) : configRows;

	const [newKey, setNewKey] = React.useState('');
	const [newValue, setNewValue] = React.useState('');
	const [newType, setNewType] = React.useState<CustomFieldValueType>('string');

	React.useEffect(() => {
		if (isReadOnly) {
			setNewKey('');
			setNewValue('');
			setNewType('string');
		}
	}, [isReadOnly]);

	const valueTypeOptions: Array<{ value: CustomFieldValueType, label: string }> = [
		{ value: 'string', label: translate('payment.custom_field_types.string') },
		{ value: 'number', label: translate('payment.custom_field_types.number') },
		{ value: 'password', label: translate('payment.custom_field_types.password') },
		{ value: 'email', label: translate('payment.custom_field_types.email') },
		{ value: 'url', label: translate('payment.custom_field_types.url') },
		{ value: 'date', label: translate('payment.custom_field_types.date') },
	];

	const handleAddRow = () => {
		if (isReadOnly || !newKey.trim() || !newValue.trim()) return;
		onConfigRowsChange([
			...configRows,
			{ key: newKey.trim(), value: newValue.trim(), valueType: newType },
		]);
		setNewKey('');
		setNewValue('');
		setNewType('string');
	};

	const handleRemoveRow = (index: number) => {
		if (isReadOnly) return;
		onConfigRowsChange(configRows.filter((_, i) => i !== index));
	};

	return (
		<Box>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('payment.fields.custom_fields')}
			</Text>

			{rows.length > 0 && (
				<Table striped highlightOnHover mb='md'>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{translate('payment.fields.custom_field_key')}</Table.Th>
							<Table.Th>{translate('payment.fields.custom_field_value')}</Table.Th>
							<Table.Th>{translate('payment.fields.custom_field_type')}</Table.Th>
							<Table.Th style={{ width: 50 }} />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.map((field, index) => (
							<Table.Tr key={`${field.key}-${index}`}>
								<Table.Td>{field.key}</Table.Td>
								<Table.Td>{renderStoredValue(field.valueType, field.value)}</Table.Td>
								<Table.Td>
									<Badge size='sm' variant='light'>
										{valueTypeOptions.find((o) => o.value === field.valueType)?.label
											|| field.valueType}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Button
										variant='subtle'
										color='red'
										size='xs'
										disabled={isReadOnly}
										onClick={() => handleRemoveRow(index)}
										aria-label={translate('action.delete')}
									>
										<IconTrash size={14} />
									</Button>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			)}

			{rows.length === 0 && (
				<Text size='sm' c='dimmed' mb='sm'>
					{translate('payment.messages.no_custom_fields')}
				</Text>
			)}

			<Stack gap='xs' mt={rows.length > 0 ? 'md' : 0}>
				<Group gap='xs' align='flex-end'>
					<TextInput
						placeholder={translate('payment.fields.custom_field_key')}
						value={newKey}
						onChange={(e) => setNewKey(e.currentTarget.value)}
						readOnly={isReadOnly}
						style={{ flex: 1 }}
					/>
					<Select
						placeholder={translate('payment.fields.custom_field_type')}
						value={newType}
						onChange={(v) => setNewType((v || 'string') as CustomFieldValueType)}
						data={valueTypeOptions}
						disabled={isReadOnly}
						style={{ width: 150 }}
					/>
				</Group>
				<Group gap='xs' align='flex-end'>
					<TextInput
						placeholder={translate('payment.fields.custom_field_value')}
						value={newValue}
						onChange={(e) => setNewValue(e.currentTarget.value)}
						type={newType === 'password' ? 'password' : newType === 'number' ? 'number' : 'text'}
						readOnly={isReadOnly}
						style={{ flex: 1 }}
					/>
					<Button
						onClick={handleAddRow}
						disabled={isReadOnly || !newKey.trim() || !newValue.trim()}
					>
						{translate('action.add')}
					</Button>
				</Group>
			</Stack>
		</Box>
	);
};
