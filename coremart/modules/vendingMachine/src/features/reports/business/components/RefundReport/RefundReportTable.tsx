import { Alert, Anchor, Button, Group, Text, Title } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDownload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { TableContainer, TablePagination } from '@/components/Table';

import { useRefundOrders } from '../../hooks';

import type { RefundColumnKey, RefundReportAppliedFilters } from './type';
import type { OrderRefundReport } from './type';


const REFUND_TABLE_COLUMNS: RefundColumnKey[] = [
	'occurredAt',
	'reference',
	'kiosk',
	'createdBy',
	'refundMethod',
	'amount',
	'refundedBy',
	'reason',
];

const refundReportSchema: ModelSchema = {
	name: 'RefundReport',
	fields: {
		occurredAt: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.date' },
		reference: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.reference' },
		kiosk: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.kiosk' },
		createdBy: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.createdBy' },
		refundMethod: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.refundMethod' },
		amount: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.amount' },
		refundedBy: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.refundedBy' },
		reason: { type: 'string', label: 'coremart.vendingMachine.reports.refundReport.columns.reason' },
		orderId: { type: 'string', label: 'orderId', hidden: true },
	},
};

function mapOrderToRow(order: OrderRefundReport): Record<string, unknown> {
	return {
		occurredAt: dayjs(order.orderTime).format('DD/MM/YYYY HH:mm:ss'),
		reference: order.orderCode,
		orderId: order.kioskId,
		kiosk: order.kioskName,
		createdBy: order.createdByName || order.createdByEmail || '—',
		refundMethod: order.refundMethod,
		amount: new Intl.NumberFormat('vi-VN').format(Math.abs(Number(order.refundAmount))),
		refundedBy: order.approveByName || order.approveByEmail || '—',
		reason: order.refundReason || '—',
		orderCode: order.orderCode,
	};
}

type RefundReportTableProps = {
	applied: RefundReportAppliedFilters;
};

export function RefundReportTable({ applied }: RefundReportTableProps): React.ReactElement {
	const { t: translate } = useTranslation();

	const { items, isLoading, error, pagination, handleExport } = useRefundOrders(applied);

	const tableData = useMemo(() => items.map(mapOrderToRow), [items]);

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		occurredAt: (row) => <Text size='sm'>{String(row.occurredAt ?? '—')}</Text>,
		reference: (row) => (
			<Anchor
				component={Link}
				to={`../reports/orders/${encodeURIComponent(String(row.orderCode ?? ''))}`}
				size='sm'
			>
				{String(row.reference ?? '—')}
			</Anchor>
		),
		kiosk: (row) => <Text size='sm'>{String(row.kiosk ?? '—')}</Text>,
		createdBy: (row) => <Text size='sm'>{String(row.createdBy ?? '—')}</Text>,
		refundMethod: (row) => <Text size='sm'>{String(row.refundMethod ?? '—')}</Text>,
		amount: (row) => <Text size='sm' ta='end'>{String(row.amount ?? '—')}</Text>,
		refundedBy: (row) => <Text size='sm'>{String(row.refundedBy ?? '—')}</Text>,
		reason: (row) => <Text size='sm'>{String(row.reason ?? '—')}</Text>,
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		amount: () => (
			<Text fw={600} fz='sm' ta='end'>
				{translate('coremart.vendingMachine.reports.refundReport.columns.amount')}
			</Text>
		),
	};

	if(error) {
		return (
			<Alert color='red.4' bg='red.0'>
				{error}
			</Alert>
		);
	}

	return (
		<TableContainer
			minWidth={960}
			withBorder
			shadow='sm'
			unstyledScrollContainer
			header={
				<Group justify='space-between' mb={6}>
					<Title order={4} fw={600}>{translate('coremart.vendingMachine.reports.refundReport.table.title')}</Title>
					<Button
						size='sm'
						leftSection={<IconDownload size={16} />}
						disabled={isLoading || !pagination.totalItems}
						onClick={handleExport}
					>
						{translate('coremart.vendingMachine.reports.revenueReport.export')}
					</Button>
				</Group>
			}
			footer={<TablePagination {...pagination} />}
		>
			<AutoTable
				columns={[...REFUND_TABLE_COLUMNS]}
				data={tableData}
				schema={refundReportSchema}
				isLoading={isLoading}
				columnRenderers={colRenderers}
				headerRenderers={headerRenderers}
				striped='even'
				highlightOnHover
				theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
			/>
		</TableContainer>
	);
}
