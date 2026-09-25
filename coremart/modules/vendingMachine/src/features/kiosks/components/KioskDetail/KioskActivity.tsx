/* eslint-disable max-lines-per-function */
import {
	Button, Group, Select, Stack, Text, TextInput,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { kioskActions, selectKioskLogs, VendingMachineDispatch } from '@/appState';
import { buildSimpleSearchGraph, SimpleFilter } from '@/common/helpers';
import { usePagination } from '@/common/hooks';
import { camelToKebab } from '@/common/utils';
import { RangePicker } from '@/components/RangePicker';
import { TableContainer, TablePagination } from '@/components/Table';
import { SearchGraph } from '@/types';

import {
	formatKioskActivityTimestamp,
	KioskActivityDetailModal,
	KioskActivityTypeBadge,
} from './KioskActivityDetailModal';
import { KioskActivityLogType, KioskLog } from '../../types';


type KioskActivityDateRange = React.ComponentProps<typeof RangePicker>['value'];
const kioskActivityLogSchema: ModelSchema = {
	name: 'kioskActivityLog',
	fields: {
		id: { type: 'string', label: '', hidden: true },
		createdAt: { type: 'string', label: 'coremart.vendingMachine.kiosk.activity.fields.time' },
		logType: { type: 'string', label: 'coremart.vendingMachine.kiosk.activity.fields.type' },
		payload: { type: 'string', label: 'coremart.vendingMachine.kiosk.activity.fields.content' },
		actions: { type: 'string', label: 'nikki.general.actions.title' },
	},
};


export const KioskActivity: React.FC = () => {
	const { t: translate } = useTranslation();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const kioskLogs = useMicroAppSelector(selectKioskLogs);
	const [selectedLog, setSelectedLog] = useState<KioskLog | null>(null);
	const [detailModalOpened, setDetailModalOpened] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState<KioskActivityDateRange>([null, null]);

	const graph = useMemo(() => {
		const filters: SimpleFilter[] = [];
		if (searchQuery) {
			filters.push({
				key: 'search',
				type: 'search',
				value: searchQuery,
				searchFields: ['message', 'logType', 'payload'],
			});
		}
		if (selectedType) {
			filters.push({
				key: 'logType',
				type: 'select',
				value: [camelToKebab(selectedType)],
			});
		}
		const [rawStart, rawEnd] = dateRange ?? [null, null];
		const startDate = rawStart != null && rawStart !== '' ? dayjs(rawStart).startOf('day').toDate() : null;
		const endDate = rawEnd != null && rawEnd !== '' ? dayjs(rawEnd).endOf('day').toDate() : null;
		if (startDate || endDate) {
			filters.push({
				key: 'createdAt',
				type: 'date',
				value: [startDate, endDate],
			});
		}

		return buildSimpleSearchGraph(filters);
	}, [selectedType, dateRange, searchQuery]);

	const graphKey = useMemo(() => JSON.stringify(graph), [graph]);

	const fetchKioskLogs = useCallback((targetPage: number, size: number, g?: SearchGraph) => {
		dispatch(kioskActions.searchKioskLogs({ page: targetPage - 1, size, graph: g }));
	}, [dispatch]);

	const pagination = usePagination(fetchKioskLogs, selectKioskLogs, {
		graph,
		resetPageKey: graphKey,
		fallbackPageSize: 10,
	});
	const { page, pageSize } = pagination;

	useEffect(() => {
		fetchKioskLogs(page, pageSize, graph);
	}, [fetchKioskLogs, page, pageSize, graph]);

	const handleViewDetail = useCallback((log: KioskLog) => {
		setSelectedLog(log);
		setDetailModalOpened(true);
	}, []);

	const handleCloseDetailModal = useCallback(() => {
		setDetailModalOpened(false);
		setSelectedLog(null);
	}, []);

	const activityTableData = useMemo(
		() => kioskLogs.items.map((log: KioskLog) => ({
			...log,
			actions: '',
		})) as Record<string, unknown>[],
		[kioskLogs.items],
	);

	const activityColumnRenderers = useMemo(
		() => ({
			createdAt: (row: Record<string, unknown>) => (
				<Text size='sm'>{formatKioskActivityTimestamp(String(row.createdAt))}</Text>
			),
			logType: (row: Record<string, unknown>) => (
				<KioskActivityTypeBadge logType={row.logType as KioskActivityLogType} />
			),
			payload: (row: Record<string, unknown>) => (
				<Text size='sm' lineClamp={2}>
					{row.payload != null ? JSON.stringify(row.payload, null, 2)?.slice(0, 100) + ' ...' : ''}
				</Text>
			),
			actions: (row: Record<string, unknown>) => (
				<Button
					size='xs'
					variant='subtle'
					onClick={() => handleViewDetail(row as unknown as KioskLog)}
				>
					{translate('nikki.general.actions.view')}
				</Button>
			),
		}),
		[translate, handleViewDetail],
	);

	return (
		<Stack gap='md'>
			<Group gap='md' align='flex-end'>
				<TextInput
					placeholder={translate('coremart.vendingMachine.kiosk.activity.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.currentTarget.value);
					}}
					style={{ flex: 1 }}
				/>
				<Select
					placeholder={translate('coremart.vendingMachine.kiosk.activity.filter.type')}
					value={selectedType}
					onChange={(v) => {
						setSelectedType(v);
					}}
					data={[
						{ value: KioskActivityLogType.WARNING, label: translate('coremart.vendingMachine.kiosk.activity.type.warning') },
						{ value: KioskActivityLogType.STATUS_DETAIL, label: translate('coremart.vendingMachine.kiosk.activity.type.statusDetail') },
						{ value: KioskActivityLogType.ERROR, label: translate('coremart.vendingMachine.kiosk.activity.type.error') },
						{ value: KioskActivityLogType.INFORM, label: translate('coremart.vendingMachine.kiosk.activity.type.inform') },
					]}
					clearable
				/>
				<RangePicker
					w={280}
					placeholder={translate('coremart.vendingMachine.common.datePicker.selectDateRange')}
					value={dateRange}
					onChange={(v) => {
						setDateRange(v);
					}}
					valueFormat='DD/MM/YYYY'
					clearable
				/>
			</Group>

			<TableContainer
				footer={
					<TablePagination
						totalItems={pagination.totalItems}
						page={pagination.page}
						totalPages={pagination.totalPages}
						onPageChange={pagination.onPageChange}
						pageSize={pagination.pageSize}
						onPageSizeChange={pagination.onPageSizeChange}
					/>
				}
			>
				<AutoTable
					columns={['createdAt', 'logType', 'payload', 'actions']}
					data={activityTableData}
					schema={kioskActivityLogSchema}
					columnRenderers={activityColumnRenderers}
					isLoading={kioskLogs.status === 'pending' && !activityTableData.length}
					striped='even'
					highlightOnHover
					theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
				/>
			</TableContainer>

			<KioskActivityDetailModal
				opened={detailModalOpened}
				onClose={handleCloseDetailModal}
				log={selectedLog}
			/>
		</Stack>
	);
};
