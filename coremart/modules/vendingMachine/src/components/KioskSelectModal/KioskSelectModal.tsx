import { Button, Group, Modal, ScrollArea, Space, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconDeviceDesktop, IconMapPin, IconSearch } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { buildSimpleSearchGraph } from '@/common/helpers';
import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { TablePagination } from '@/components/Table';
import { useKioskList } from '@/features/kiosks/hooks';
import { Kiosk, KioskMode } from '@/features/kiosks/types';
import { SearchGraph } from '@/types';

import { KioskModeStatusBadge } from '../KioskModeStatusBadge';


export interface KioskSelectModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectKiosks: (kiosks: Kiosk[]) => void;
	graph?: SearchGraph;
}

// eslint-disable-next-line max-lines-per-function
export const KioskSelectModal: React.FC<KioskSelectModalProps> = ({
	graph = {},
	opened,
	onClose,
	onSelectKiosks,
}) => {
	const { t: translate } = useTranslation();
	const [selectedKiosks, setSelectedKiosks] = useState<Kiosk[]>([]);
	const [searchQuery, setSearchQuery] = useState('');

	const queryKioskGraph = useMemo(
		(): SearchGraph => {
			const searchCondition = buildSimpleSearchGraph([
				{
					key: 'search',
					type: 'search',
					value: searchQuery,
					searchFields: ['code', 'name', 'locationAddress'],
				},
			]);

			return {
				and: [
					{...graph},
					{...searchCondition},
				],
			};
		},
		[graph, searchQuery],
	);
	const { kiosks: searchedKiosks, handleRefresh, pagination } = useKioskList({ graph: queryKioskGraph });

	const handleToggleKiosk = (kiosk: Kiosk) => {
		setSelectedKiosks((prev) => {
			const exists = prev.find((k) => k.id === kiosk.id);
			if (exists) {
				return prev.filter((k) => k.id !== kiosk.id);
			}
			return [...prev, kiosk];
		});
	};

	const handleConfirm = () => {
		onSelectKiosks(selectedKiosks);
		setSelectedKiosks([]);
		setSearchQuery('');
		onClose();
	};

	const handleCancel = () => {
		setSelectedKiosks([]);
		setSearchQuery('');
		onClose();
	};

	useEffect(() => {
		if (opened) handleRefresh();
	}, [opened, handleRefresh]);

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('coremart.vendingMachine.events.selectKiosks.title')}
			centered
			size='xl'
		>
			<Stack gap='md'>
				{/* Search */}
				<TextInput
					placeholder={translate('coremart.vendingMachine.events.selectKiosks.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
				/>

				{/* Selected Count */}
				{selectedKiosks.length > 0 && (
					<Text size='sm' c='blue' fw={500}>
						{translate('coremart.vendingMachine.events.selectKiosks.selectedCount', { count: selectedKiosks.length })}
					</Text>
				)}

				{/* Kiosks Table */}
				<ScrollArea h={400}>
					{searchedKiosks.length === 0 ? (
						<Text size='sm' c='dimmed' ta='center' py='md'>
							{translate('coremart.vendingMachine.events.selectKiosks.noKiosks')}
						</Text>
					) : (
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th style={{ width: 50 }}></Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kiosk.fields.code')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kiosk.fields.name')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kiosk.fields.address')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kiosk.fields.status')}</Table.Th>
									<Table.Th>{translate('coremart.vendingMachine.kiosk.fields.mode')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{searchedKiosks?.map((kiosk: Kiosk) => {
									const isSelected = selectedKiosks.some((k) => k.id === kiosk.id);
									return (
										<Table.Tr
											key={kiosk.id}
											style={{
												cursor: 'pointer',
												backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
											}}
											onClick={() => handleToggleKiosk(kiosk)}
										>
											<Table.Td>
												<input
													type='checkbox'
													checked={isSelected}
													onChange={() => handleToggleKiosk(kiosk)}
													onClick={(e) => e.stopPropagation()}
												/>
											</Table.Td>
											<Table.Td>
												<Text size='sm' fw={500}>{kiosk.code}</Text>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<IconDeviceDesktop size={16} />
													<Text size='sm'>{kiosk.name}</Text>
												</Group>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<IconMapPin size={14} />
													<Text size='sm' lineClamp={1} style={{ maxWidth: 200 }}>
														{kiosk.locationAddress}
													</Text>
												</Group>
											</Table.Td>
											<Table.Td>
												<ArchivedStatusBadge isArchived={Boolean(kiosk.isArchived)} />
											</Table.Td>
											<Table.Td>
												<KioskModeStatusBadge mode={kiosk.mode as KioskMode} />
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					)}
				</ScrollArea>

				<TablePagination
					totalItems={pagination.totalItems}
					page={pagination.page}
					totalPages={pagination.totalPages}
					pageSize={pagination.pageSize}
					onPageChange={pagination.onPageChange}
					onPageSizeChange={pagination.onPageSizeChange}
				/>

				<Space h='sm' />

				{/* Actions */}
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleCancel}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} disabled={selectedKiosks.length === 0}>
						{translate('nikki.general.actions.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
