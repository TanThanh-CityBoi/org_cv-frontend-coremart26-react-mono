import {
	Badge, Box, Button, Divider, Group, Image, Select, Stack, Table, Text, TextInput,
} from '@mantine/core';
import { IconCreditCard, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { PreviewDrawer } from '../../../../components/PreviewDrawer';
import { CustomFieldValueType, PaymentMethod, PaymentMethodConfigValue } from '../../types';


export interface PaymentDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	payment: PaymentMethod | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
	opened,
	onClose,
	payment,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();
	const [customFields, setCustomFields] =
		useState<PaymentMethodConfigValue[]>(Object.values(payment?.config || {}) || []);

	const [newFieldKey, setNewFieldKey] = useState('');
	const [newFieldValue, setNewFieldValue] = useState('');
	const [newFieldType, setNewFieldType] = useState<CustomFieldValueType>('string');

	const handleAddCustomField = () => {
		if (newFieldKey.trim() && newFieldValue.trim()) {
			setCustomFields([...customFields, {
				key: newFieldKey.trim(),
				value: newFieldValue.trim(),
				valueType: newFieldType,
			}]);
			setNewFieldKey('');
			setNewFieldValue('');
			setNewFieldType('string');
		}
	};

	const handleRemoveCustomField = (index: number) => {
		setCustomFields(customFields.filter((_, i) => i !== index));
	};

	const renderCustomFieldValue = (field: any) => {
		switch (field.valueType) {
			case 'password':
				return '••••••••';
			default:
				return field.value;
		}
	};

	const valueTypeOptions: Array<{ value: CustomFieldValueType, label: string }> = [
		{ value: 'string', label: translate('payment.custom_field_types.string') },
		{ value: 'number', label: translate('payment.custom_field_types.number') },
		{ value: 'password', label: translate('payment.custom_field_types.password') },
		{ value: 'email', label: translate('payment.custom_field_types.email') },
		{ value: 'url', label: translate('payment.custom_field_types.url') },
		{ value: 'date', label: translate('payment.custom_field_types.date') },
	];

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: payment?.name,
				subtitle: payment?.method,
				avatar: payment?.image ? (
					<Box w={48} h={48}>
						<Image
							src={payment.image as string}
							alt={String(payment.name || '')}
							width={48}
							height={48}
							radius='sm'
							style={{ objectFit: 'contain' }}
						/>
					</Box>
				) : (
					<IconCreditCard size={26} stroke={1.5} />
				),
			}}
			onViewDetails={() => {
				if (payment?.id) {
					navigate(`../payment/${payment.id}`);
				}
				onClose();
			}}
			isLoading={isLoading}
			isNotFound={!payment && !isLoading}
			drawerProps={{ size: 'lg', opened, onClose }}
		>
			<Stack gap='md'>
				<Box>
					<Text size='sm' c='dimmed' mb={3} fw={500}>
						{translate('payment.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{payment?.method}</Text>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb={3} fw={500}>
						{translate('payment.fields.name')}
					</Text>
					<Text size='sm'>{payment?.name}</Text>
				</Box>

				{payment?.image && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb={3} fw={500}>
								{translate('payment.fields.image')}
							</Text>
							<Box w={64} h={64}>
								<Image
									src={payment.image as string}
									alt={String(payment.name || '')}
									width={64}
									height={64}
									radius='sm'
									style={{ objectFit: 'contain' }}
								/>
							</Box>
						</div>
					</>
				)}

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb={3} fw={500}>
						{translate('payment.fields.status')}
					</Text>
					{payment ? <ArchivedStatusBadge isArchived={payment.isArchived} /> : null}
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs' fw={500}>
						{translate('payment.fields.custom_fields')}
					</Text>
					{customFields.length > 0 && (
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{translate('payment.fields.custom_field_key')}</Table.Th>
									<Table.Th>{translate('payment.fields.custom_field_value')}</Table.Th>
									<Table.Th>{translate('payment.fields.custom_field_type')}</Table.Th>
									<Table.Th style={{ width: 50 }}></Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{customFields.map((field, index) => (
									<Table.Tr key={index}>
										<Table.Td>{field.key}</Table.Td>
										<Table.Td>{renderCustomFieldValue(field)}</Table.Td>
										<Table.Td>
											<Badge size='sm' variant='light'>
												{valueTypeOptions.find(
													(opt) => opt.value === field.valueType)?.label || field.valueType}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Button
												variant='subtle'
												color='red'
												size='xs'
												onClick={() => handleRemoveCustomField(index)}
											>
												<IconTrash size={14} />
											</Button>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					)}

					<Stack gap='xs' mt='md'>
						<Group gap='xs' align='flex-end'>
							<TextInput
								placeholder={translate('payment.fields.custom_field_key')}
								value={newFieldKey}
								onChange={(e) => setNewFieldKey(e.currentTarget.value)}
								style={{ flex: 1 }}
							/>
							<Select
								placeholder={translate('payment.fields.custom_field_type')}
								value={newFieldType}
								onChange={(value) => setNewFieldType(value as CustomFieldValueType)}
								data={valueTypeOptions}
								style={{ width: 150 }}
							/>
						</Group>
						<Group gap='xs' align='flex-end'>
							<TextInput
								placeholder={translate('payment.fields.custom_field_value')}
								value={newFieldValue}
								onChange={(e) => setNewFieldValue(e.currentTarget.value)}
								type={newFieldType === 'password' ? 'password' : newFieldType === 'number' ? 'number' : 'text'}
								style={{ flex: 1 }}
							/>
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={handleAddCustomField}
								disabled={!newFieldKey.trim() || !newFieldValue.trim()}
							>
								{translate('action.add')}
							</Button>
						</Group>
					</Stack>
				</Box>

				<Divider />

				<Box>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('payment.fields.created_at')}
					</Text>
					<Text size='sm'>{payment?.createdAt ? new Date(payment.createdAt).toLocaleString() : '—'}</Text>
				</Box>
			</Stack>
		</PreviewDrawer>
	);
};
