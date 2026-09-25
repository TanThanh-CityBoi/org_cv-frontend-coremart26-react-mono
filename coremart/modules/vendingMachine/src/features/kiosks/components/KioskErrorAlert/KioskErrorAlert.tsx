import {
	Badge,
	Button,
	Card,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { AutoTable, TablePagination } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import {
	IconAlertCircle,
	IconArrowRight,
	IconCheck,
	IconClock,
	IconLoader,
} from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { formatDateTime } from '@/common/helpers';
import { PaginationConfig } from '@/common/hooks';
import { TableContainer } from '@/components/Table';
import { KioskWarning, KioskWarningLevel, KioskWarningStatus } from '@/features/reports/operations/type';


interface KioskErrorAlertProps {
	warnings: KioskWarning[];
	pagination: PaginationConfig;
	detailLink?: string;
}

const kioskWarningSchema: ModelSchema = {
	name: 'kioskWarning',
	fields: {
		id: { type: 'string', label: '', hidden: true },
		kioskRef: { type: 'string', label: 'coremart.vendingMachine.overview.errorAlerts.kioskRef' },
		level: { type: 'string', label: 'coremart.vendingMachine.overview.errorAlerts.level' },
		description: { type: 'string', label: 'coremart.vendingMachine.overview.errorAlerts.description' },
		status: { type: 'string', label: 'coremart.vendingMachine.overview.errorAlerts.status' },
		createdAt: { type: 'string', label: 'coremart.vendingMachine.overview.errorAlerts.reportedAt' },
	},
};

const LEVEL_COLOR: Record<KioskWarningLevel, string> = {
	low: 'blue',
	medium: 'yellow',
	high: 'orange',
	critical: 'red',
};

const STATUS_COLOR: Record<KioskWarningStatus, string> = {
	waiting: 'gray',
	handling: 'blue',
	processing: 'yellow',
	processed: 'green',
};

const STATUS_ICON: Record<KioskWarningStatus, React.ReactNode> = {
	waiting: <IconAlertCircle size={16} />,
	handling: <IconClock size={16} />,
	processing: <IconLoader size={16} />,
	processed: <IconCheck size={16} />,
};

function getLevelColor(level: string): string {
	return LEVEL_COLOR[level as KioskWarningLevel] ?? 'gray';
}

function getStatusColor(status: string): string {
	return STATUS_COLOR[status as KioskWarningStatus] ?? 'gray';
}

function getStatusIcon(status: string): React.ReactNode {
	return STATUS_ICON[status as KioskWarningStatus] ?? <IconAlertCircle size={16} />;
}


function renderKioskRefColumn(row: KioskWarning) {
	return (
		<Group gap='xs'>
			{getStatusIcon(row.status)}
			<Text size='sm' fw={500}>
				{row.kiosk?.name ?? row.kioskRef ?? ''}
			</Text>
		</Group>
	);
}

function renderLevelColumn(row: Record<string, unknown>) {
	const level = String(row.level ?? '');
	return (
		<Badge color={getLevelColor(level)} variant='filled' size='sm'>
			{level}
		</Badge>
	);
}

function renderDescriptionColumn(row: Record<string, unknown>) {
	return (
		<Text size='sm' lineClamp={2}>
			{String(row.description ?? '')}
		</Text>
	);
}

function renderStatusColumn(row: Record<string, unknown>, translate: (key: string) => string) {
	const status = String(row.status ?? '');
	return (
		<Badge color={getStatusColor(status)} variant='filled' size='sm'>
			{translate(`coremart.vendingMachine.overview.error.status.${status}`)}
		</Badge>
	);
}

function renderCreatedAtColumn(row: KioskWarning) {
	return (
		<Text size='sm'>
			{formatDateTime(String(row.createdAt ?? ''))}
		</Text>
	);
}


export function KioskErrorAlert({ warnings, pagination, detailLink }: KioskErrorAlertProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const totalWarnings = pagination.totalItems;
	const waitingCount = warnings.filter(w => w.status === 'waiting').length;
	const inProgressCount = warnings.filter(w => w.status === 'handling' || w.status === 'processing').length;
	const processedCount = warnings.filter(w => w.status === 'processed').length;

	return (
		<Card shadow='sm' padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Title order={4}>
						{translate('coremart.vendingMachine.overview.errorAlerts.title')}
					</Title>
					<Group gap='xs'>
						{/* <Badge color='gray' variant='light'>
							{waitingCount} {translate('coremart.vendingMachine.overview.errorAlerts.waiting')}
						</Badge>
						<Badge color='blue' variant='light'>
							{inProgressCount} {translate('coremart.vendingMachine.overview.errorAlerts.inProgress')}
						</Badge>
						<Badge color='green' variant='light'>
							{processedCount}/{totalWarnings} {translate('coremart.vendingMachine.overview.errorAlerts.processed')}
						</Badge> */}
						<Badge color='orange.5' variant='filled'>
							{totalWarnings} {translate('coremart.vendingMachine.overview.errorAlerts.totalWarnings')}
						</Badge>
						{detailLink && (
							<Button
								component={Link}
								to={detailLink}
								variant='light'
								size='xs'
								rightSection={<IconArrowRight size={16} />}
							>
								{translate('coremart.vendingMachine.overview.errorAlerts.viewDetails')}
							</Button>
						)}
					</Group>
				</Group>

				{warnings.length > 0 ? (
					<Stack gap='xs'>
						<TableContainer>
							<AutoTable
								columns={['kioskRef', 'level', 'status', 'description', 'createdAt']}
								data={warnings}
								schema={kioskWarningSchema}
								columnRenderers={{
									kioskRef: (row) => renderKioskRefColumn(row as KioskWarning),
									level: renderLevelColumn,
									description: renderDescriptionColumn,
									status: (row) => renderStatusColumn(row, translate),
									createdAt: (row) => renderCreatedAtColumn(row as KioskWarning),
								}}
								striped='even'
								highlightOnHover
								theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
							/>
						</TableContainer>
						<TablePagination {...pagination} />
					</Stack>
				) : (
					<Text c='dimmed' ta='center' py='xl'>
						{translate('coremart.vendingMachine.overview.errorAlerts.noErrors')}
					</Text>
				)}
			</Stack>
		</Card>
	);
}
