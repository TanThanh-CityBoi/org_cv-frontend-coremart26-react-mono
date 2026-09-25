/* eslint-disable max-lines-per-function */
import { Button, Group, Modal, ScrollArea, Space, Stack, Table, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { buildSimpleSearchGraph } from '@/common/helpers';
import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { TablePagination } from '@/components/Table';
import { useKioskSettingList } from '@/features/kioskSettings/hooks';

import type { KioskSetting } from '@/features/kioskSettings/types';


export interface KioskSettingSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectSettings: (settings: KioskSetting[]) => void;
}

export const KioskSettingSelectModal: React.FC<KioskSettingSelectModalProps> = ({
	opened,
	onClose,
	onSelectSettings,
}) => {
	const { t: translate } = useTranslation();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearch] = useDebouncedValue(searchQuery.trim(), 300);

	const searchGraph = useMemo(() => {
		if (!debouncedSearch) return undefined;
		return buildSimpleSearchGraph([{
			key: 'query',
			type: 'search',
			value: debouncedSearch,
			searchFields: ['code', 'name', 'description'],
		}]);
	}, [debouncedSearch]);

	const [selected, setSelected] = useState<KioskSetting | null>(null);
	const {
		settings,
		isLoadingList,
		pagination,
	} = useKioskSettingList({ enabled: opened, graph: searchGraph });

	const rows = settings ?? [];

	const handleConfirm = () => {
		if (selected) {
			onSelectSettings([selected]);
		}
		setSelected(null);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelected(null);
		setSearchQuery('');
		onClose();
	};

	const showEmpty = !isLoadingList && rows.length === 0;

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('coremart.vendingMachine.kioskSettings.selectSetting.title')}
			size='xl'
		>
			<Stack gap='md'>
				<TextInput
					placeholder={translate('coremart.vendingMachine.kioskSettings.selectSetting.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{selected ? (
					<Text size='sm' c='blue' fw={500}>
						{translate(
							'coremart.vendingMachine.kioskSettings.selectSetting.selectedLabel',
							{ name: selected.name },
						)}
					</Text>
				) : null}

				<ScrollArea h={400}>
					{isLoadingList ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('nikki.general.messages.loading')}
						</Text>
					) : showEmpty ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('coremart.vendingMachine.kioskSettings.selectSetting.noSettings')}
						</Text>
					) : (
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th style={{ width: 40 }} />
									<Table.Th>{translate('coremart.vendingMachine.kioskSettings.fields.code')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kioskSettings.fields.name')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kioskSettings.fields.description')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kioskSettings.fields.status')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{rows.map((row: KioskSetting) => {
									const isSel = selected?.id === row.id;
									return (
										<Table.Tr
											key={row.id}
											style={{
												cursor: 'pointer',
												backgroundColor: isSel ? 'var(--mantine-color-blue-0)' : undefined,
											}}
											onClick={() => setSelected(row)}
										>
											<Table.Td>
												<input
													type='radio'
													checked={isSel}
													readOnly
													aria-label={row.name}
												/>
											</Table.Td>
											<Table.Td>
												<Text size='sm' fw={500}>{row.code}</Text>
											</Table.Td>
											<Table.Td>
												<Text size='sm' lineClamp={2}>{row.name}</Text>
											</Table.Td>
											<Table.Td>
												<Text size='sm' c='dimmed' lineClamp={2}>{row.description ?? '—'}</Text>
											</Table.Td>
											<Table.Td>
												<ArchivedStatusBadge isArchived={Boolean(row.isArchived)} />
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					)}
				</ScrollArea>

				<TablePagination {...pagination} />

				<Space h='sm' />

				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={!selected}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
