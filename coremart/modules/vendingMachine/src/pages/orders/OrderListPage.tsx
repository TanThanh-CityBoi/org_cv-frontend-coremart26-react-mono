import { notifications } from '@mantine/notifications';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import {
	OrderHistoryModal,
	OrderRefundModal,
	OrderTable,
	OrderTableActions,
	OrderPageProvider,
	orderSchema,
	useOrderPageConfig,
	useOrderPageContext,
	type VdOrder,
} from '@/features/orders';
import { ORDER_TABLE_COLUMNS } from '@/features/orders/components/OrderTable/OrderTable';


export const OrderListPage: React.FC = () => {
	return (
		<OrderPageProvider>
			<OrderListPageContent />
		</OrderPageProvider>
	);
};

const OrderListPageContent: React.FC = () => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const { filter: {
		filters,
		// createdFrom,
		// setCreatedFrom,
		// createdTo,
		// setCreatedTo,
	}, list: { orders, isLoading, isEmpty, pagination } } = useOrderPageContext();
	const { breadcrumbs, actions } = useOrderPageConfig();

	const [refundId, setRefundId] = useState<string | null>(null);
	const [historyId, setHistoryId] = useState<string | null>(null);

	const openInvoice = useCallback((order: VdOrder) => {
		notifications.show({
			color: 'blue',
			title: translate('coremart.vendingMachine.orders.invoice.pending_title'),
			message: translate('coremart.vendingMachine.orders.invoice.pending_message', { id: order.id }),
		});
	}, [translate]);

	const tableActions: OrderTableActions = {
		viewDetail: (o) => navigate(`../reports/orders/${o.orderCode}`),
		refund: (o) => setRefundId(o.id),
		invoice: openInvoice,
		history: (o) => setHistoryId(o.id),
	};

	const rows = orders.map((o: VdOrder) => ({
		...o,
		orderCode: o.orderCode || o.id,
	})) as unknown as Record<string, unknown>[];

	return (
		<PageContainer
			documentTitle={translate('coremart.vendingMachine.menu.orders')}
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					key='order-filters'
					actions={actions}
					filters={filters}
				/>,
			]}
			isLoading={isLoading}
			isEmpty={isEmpty}
		>
			<OrderTable
				columns={[...ORDER_TABLE_COLUMNS]}
				data={rows}
				schema={orderSchema as ModelSchema}
				actions={tableActions}
				isLoading={isLoading}
				pagination={pagination}
			/>
			<OrderRefundModal opened={!!refundId} onClose={() => setRefundId(null)} orderId={refundId} />
			<OrderHistoryModal opened={!!historyId} onClose={() => setHistoryId(null)} orderId={historyId} />
		</PageContainer>
	);
};
