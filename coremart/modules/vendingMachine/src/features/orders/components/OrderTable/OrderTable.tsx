/* eslint-disable max-lines-per-function */
import { Badge, Button, Group, Text, Title } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import {
	IconDownload,
	IconEye,
	IconFileInvoice,
	IconHistory,
	IconReceiptRefund,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TablePagination, TablePaginationProps } from '../../../../components/Table';
import { NameCell, TableAction, TableContainer, type TableActionItem } from '../../../../components/Table';
import { formatOrderMoney } from '../../formatters';
import { VdOrder, VdOrderCurrency, VdOrderStatus, VdPaymentMethod, VdTxLineStatus } from '../../types';


export const ORDER_TABLE_COLUMNS = [
	'createdAt',
	'orderCode',
	// 'chainKey',
	'kioskRef',
	'paymentMethod',
	'status',
	// 'paymentStatus',
	'refundStatus',
	'refundAmount',
	'amount',
	'actions',
] as const;

/** Same-chain group on order detail: no kiosk/payment/actions. */
export const CHAIN_GROUP_ORDER_TABLE_COLUMNS = [
	'createdAt',
	'orderCode',
	'parentOrderCode',
	'status',
	'refundStatus',
	'refundAmount',
	'amount',
] as const;

const ORDER_ACTIONS = {
	VIEW_DETAIL: 'viewDetail',
	REFUND: 'refund',
	INVOICE: 'invoice',
	HISTORY: 'history',
} as const;
type OrderActionType = (typeof ORDER_ACTIONS)[keyof typeof ORDER_ACTIONS];

export type OrderTableActions = {
	[key in OrderActionType]?: (order: VdOrder, ...args: unknown[]) => void;
};

function orderStatusColor(s: VdOrderStatus): string {
	const m: Record<VdOrderStatus, string> = {
		idle: 'orange',
		delivery: 'blue',
		failed: 'red',
		cancelled: 'gray',
		completed: 'green',
	};
	return m[s] ?? 'gray';
}

function txStatusColor(s: VdTxLineStatus): string {
	const m: Record<VdTxLineStatus, string> = {
		pending: 'orange',
		success: 'green',
		failed: 'red',
		cancelled: 'gray',
	};
	return m[s] ?? 'gray';
}

export function getOrderTableActions(
	order: VdOrder,
	actions: OrderTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaults: (TableActionItem & { active?: boolean })[] = [
		{
			key: ORDER_ACTIONS.VIEW_DETAIL,
			label: translate('action.viewDetails'),
			icon: <IconEye size={16} />,
			onClick: () => actions[ORDER_ACTIONS.VIEW_DETAIL]?.(order),
			color: 'blue',
			active: !!actions[ORDER_ACTIONS.VIEW_DETAIL],
		},
		{
			key: ORDER_ACTIONS.REFUND,
			label: translate('orders.actions.refund'),
			icon: <IconReceiptRefund size={16} />,
			onClick: () => actions[ORDER_ACTIONS.REFUND]?.(order),
			color: 'orange',
			active: !!actions[ORDER_ACTIONS.REFUND],
		},
		{
			key: ORDER_ACTIONS.INVOICE,
			label: translate('orders.actions.invoice'),
			icon: <IconFileInvoice size={16} />,
			onClick: () => actions[ORDER_ACTIONS.INVOICE]?.(order),
			color: 'teal',
			active: !!actions[ORDER_ACTIONS.INVOICE],
		},
		{
			key: ORDER_ACTIONS.HISTORY,
			label: translate('orders.actions.history'),
			icon: <IconHistory size={16} />,
			onClick: () => actions[ORDER_ACTIONS.HISTORY]?.(order),
			color: 'indigo',
			active: !!actions[ORDER_ACTIONS.HISTORY],
		},
	];
	return defaults.filter((a) => a.active);
}

function renderActionsHeader(translate: (key: string) => string) {
	return <Text fw={600} fz='sm' ta='end'>{translate('action.title')}</Text>;
}

export interface OrderTableProps extends AutoTableProps {
	actions: OrderTableActions;
	pagination: TablePaginationProps;
	handleExport?: () => void;
	tableTitle?: string;
	containerProps?: React.ComponentProps<typeof TableContainer>;
}

export const OrderTable: React.FC<OrderTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
	handleExport,
	tableTitle,
	containerProps,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const colRenderers: Record<string, (row: VdOrder) => React.ReactNode> = {
		createdAt: (row) => (
			<Text size='sm' miw={160}>{row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—'}</Text>
		),
		orderCode: (row) => {
			const o = row as unknown as VdOrder;
			return (
				<NameCell
					content={o.orderCode}
					link={o.orderCode ? `../reports/orders/${o.orderCode}` : undefined}
				/>
			);
		},
		parentOrderCode: (row) => {
			const o = row as unknown as VdOrder;
			const code = o.parentOrderCode;
			return (
				<NameCell
					content={code || '—'}
					link={code ? `../reports/orders/${encodeURIComponent(code)}` : undefined}
				/>
			);
		},
		kioskRef: (row) => <Text size='sm' lineClamp={1}>
			{String(row.kiosk?.name ?? row.kioskRef ?? '—')}
		</Text>,
		paymentMethod: (row) => {
			const p = String(row.paymentMethod || '') as VdPaymentMethod;
			return <Text size='sm' miw={100}>{translate(`orders.payment_method.${p}`)}</Text>;
		},
		status: (row) => {
			const s = String(row.status || '') as VdOrderStatus;
			return (
				<Badge color={orderStatusColor(s)} variant='filled' miw={110}>
					{translate(`orders.order_status.${s}`)}
				</Badge>
			);
		},
		paymentStatus: (row) => {
			const s = String(row.paymentStatus || '') as VdTxLineStatus;
			return (
				<Badge color={s ? txStatusColor(s) : 'gray'} variant='outline' miw={120}>
					{s ? translate(`orders.tx_status.${s}`) : '—'}
				</Badge>
			);
		},
		refundStatus: (row) => {
			const s = (row.refundStatus ? String(row.refundStatus) : '') as VdTxLineStatus | '';
			return (
				<Badge color={s ? txStatusColor(s) : 'gray'} variant='dot' miw={120}>
					{s ? translate(`orders.tx_status.${s}`) : '—'}
				</Badge>
			);
		},
		refundAmount: (row) => {
			const o = row as unknown as VdOrder;
			return <Text ta='end' size='sm'>{formatOrderMoney(o.refundAmount, o.currency as VdOrderCurrency)}</Text>;
		},
		amount: (row) => {
			const o = row as unknown as VdOrder;
			return <Text ta='end' size='sm' miw={100}>{formatOrderMoney(o.amount, o.currency as VdOrderCurrency)}</Text>;
		},
		actions: (row) => (
			<TableAction
				actions={getOrderTableActions(row as unknown as VdOrder, actions, translate)}
				overflowMenuLabel={translate('action.title')}
			/>
		),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		refundAmount: () => {
			return <Text fw={600} fz='sm' ta='end'>{translate('orders.fields.refund_amount')}</Text>;
		},
		amount: () => {
			return <Text fw={600} fz='sm' ta='end'>{translate('orders.fields.amount')}</Text>;
		},
		actions: (_columnName) => renderActionsHeader(translate as (k: string) => string),
	};

	const header = (tableTitle || handleExport) && (
		<Group justify='space-between' align='flex-start' wrap='nowrap'>
			{tableTitle && (
				<Title order={4} fw={600} ps={3}>
					{tableTitle}
				</Title>
			)}
			{handleExport && (
				<Button
					size='sm'
					leftSection={<IconDownload size={16} />}
					disabled={isLoading || !pagination.totalItems}
					onClick={handleExport}
				>
					{translate('reports.revenue_report.export')}
				</Button>
			)}
		</Group>
	);

	return (
		<TableContainer
			{...containerProps}
			header={header}
			footer={<TablePagination {...pagination} />}
		>
			<AutoTable
				translationNs='vending_machine'
				columns={columns}
				data={data}
				schema={schema}
				isLoading={isLoading}
				columnRenderers={colRenderers as React.ComponentProps<typeof AutoTable>['columnRenderers']}
				headerRenderers={headerRenderers}
				striped='even'
				highlightOnHover
				stickyHeader
				theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
			/>
		</TableContainer>
	);
};
