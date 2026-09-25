/* eslint-disable max-lines-per-function */
import { Badge, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { OrderItemLineList } from './OrderItemLineCard';
import { asLegacyModelSchema } from '../../../../common/helpers';
import { TextLink } from '../../../../components/Text';
import { CHAIN_GROUP_ORDER_TABLE_COLUMNS, OrderTable } from '../../components/OrderTable/OrderTable';
import { formatOrderMoney } from '../../formatters';
import { useOrdersInSameChain } from '../../hooks';
import { CHAIN_GROUP_LIST_PAGE_SIZE } from '../../hooks/useOrdersInSameChain';
import { orderSchema } from '../../schemas';
import { VdOrder, VdOrderCurrency, VdOrderStatus, VdTxLineStatus } from '../../types';


export const OrderStatusBadge: React.FC<{ status: VdOrderStatus }> = ({ status }) => {
	const { t: translate } = useTranslation('vending_machine');
	return (
		<Badge color={orderStatusColor(status)} variant='filled'>
			{translate(`orders.order_status.${status}`)}
		</Badge>
	);
};

export function orderStatusColor(s: VdOrderStatus): string {
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
		success: 'blue',
		failed: 'red',
		cancelled: 'gray',
	};
	return m[s] ?? 'gray';
}

export type OrderDetailContentProps = {
	order: VdOrder,
};


export const OrderDetailContent: React.FC<OrderDetailContentProps> = ({ order }) => {
	const { t: translate } = useTranslation('vending_machine');
	const chainKey = order.chainKey?.trim() ?? '';
	const {
		orders: chainOrders,
		isLoading: chainOrdersLoading,
		error: chainOrdersError,
	} = useOrdersInSameChain(order.chainKey);

	const sortedChainOrders = React.useMemo(() => {
		return [...chainOrders].sort((a, b) => {
			const ta = new Date(a.orderTime || a.createdAt).getTime();
			const tb = new Date(b.orderTime || b.createdAt).getTime();
			return ta - tb;
		});
	}, [chainOrders]);

	const chainTableRows = React.useMemo(
		() =>
			sortedChainOrders.map((o) => ({
				...o,
				orderCode: o.orderCode || o.id,
			})) as unknown as Record<string, unknown>[],
		[sortedChainOrders],
	);

	return (
		<Stack gap='lg'>
			<Divider/>
			<Group>
				{order.status && (
					<Group>
						<Badge color={orderStatusColor(order.status)} variant='filled'>
							{translate(`orders.order_status.${order.status}`)}
						</Badge>
					</Group>
				)}
				{order.paymentStatus && (
					<Group>
						<Badge color={txStatusColor(order.paymentStatus)} variant='light'>
							{'Thanh toán'}: {translate(`orders.tx_status.${order.paymentStatus}`)}
						</Badge>
					</Group>
				)}
				{order.refundStatus && (
					<Group>
						<Badge color={txStatusColor(order.refundStatus)} variant='light'>
							{'Hoàn tiền'}: {translate(`orders.tx_status.${order.refundStatus}`)}
						</Badge>
					</Group>
				)}
			</Group>

			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.id')}</Text>
					<Text size='sm'>{order.orderCode}</Text>
				</Stack>
				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.gateway_ref')}</Text>
					<Text size='sm'>{order.gatewayRefCode || '—'}</Text>
				</Stack>

				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.parent_order_ref')}</Text>
					<TextLink size='sm' to={order.parentOrderCode ? `../reports/orders/${order.parentOrderCode}` : undefined}>{order.parentOrderCode || '—'}</TextLink>
				</Stack>

				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.root_order_ref')}</Text>
					<TextLink size='sm' to={order.chainKey !== order.orderCode ? `../reports/orders/${order.chainKey}` : undefined}>{order.chainKey || '—'}</TextLink>
				</Stack>

				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.kiosk')}</Text>
					<TextLink size='sm' to={`../kiosks/${order.kioskRef}`}>{order.kiosk?.name || order.kioskRef}</TextLink>
				</Stack>
				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.payment_method')}</Text>
					<Text size='sm'>{translate(`orders.payment_method.${order.paymentMethod}`)}</Text>
				</Stack>
				{/* <Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.content')}</Text>
					<Text size='sm'>{'—'}</Text>
				</Stack> */}
				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.created_at')}</Text>
					<Text size='sm'>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</Text>
				</Stack>
				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.updated_at')}</Text>
					<Text size='sm'>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'}</Text>
				</Stack>
				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.amount')}</Text>
					<Text size='sm' fw={600}>{formatOrderMoney(order.amount, order.currency as VdOrderCurrency)}</Text>
				</Stack>
				<Stack gap={4}>
					<Text size='sm' c='dimmed'>{translate('orders.fields.refund_amount')}</Text>
					<Text size='sm'>{formatOrderMoney(order.refundAmount, order.currency as VdOrderCurrency)}</Text>
				</Stack>
			</SimpleGrid>

			<Stack gap='sm'>
				<Divider label={<Text size='sm' fw={500}>{translate('orders.sections.items')}</Text>} labelPosition='left'/>
				<OrderItemLineList order={order} />
			</Stack>

			{/* <Divider/>
			<Stack gap='sm'>
				<Title order={4}>{translate('orders.sections.order_discount')}</Title>
				<Text size='sm' c='dimmed'>{translate('orders.order_discount.hint')}</Text>
			</Stack> */}

			{chainKey ? (
				<Stack gap='sm'>
					<Divider
						label={(
							<Text size='sm' c='dimmed'>
								{translate('orders.sections.chain_group')}
							</Text>
						)}
						labelPosition='left'
					/>
					<Stack gap='sm'>
						{chainOrdersError && (
							<Text size='sm' c='red'>{chainOrdersError}</Text>
						)}
						{!sortedChainOrders?.length ? (
							<Text size='sm' c='dimmed'>
								{translate('orders.chain_group.empty')}
							</Text>
						) :
							<OrderTable
								tableTitle={translate('orders.sections.chain_group')}
								columns={[...CHAIN_GROUP_ORDER_TABLE_COLUMNS]}
								data={chainTableRows}
								schema={asLegacyModelSchema(orderSchema)}
								actions={{}}
								isLoading={chainOrdersLoading}
								pagination={{
									totalItems: sortedChainOrders.length,
									page: 1,
									totalPages: 1,
									pageSize: CHAIN_GROUP_LIST_PAGE_SIZE,
								}}
							/>
						}
					</Stack>
				</Stack>
			) : null}
		</Stack>
	);
};
