import { notifications } from '@mantine/notifications';
import { IconReceipt } from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ControlPanel } from '@/components';
import { DetailLayout } from '@/components/DetailLayout';
import { PageContainer } from '@/components/PageContainer';
import { TextCopyable } from '@/components/Text';
import {
	OrderDetailContent,
	OrderHistoryModal,
	OrderNotFound,
	OrderRefundModal,
	useOrderDetail,
	useOrderDetailPageConfig,
} from '@/features/orders';


export const OrderDetailPage: React.FC = () => {
	const { orderCode } = useParams<{ orderCode: string }>();
	const { t: translate } = useTranslation();
	const { order, isLoading } = useOrderDetail(orderCode ? { orderCode } : {});

	const [refundOpen, setRefundOpen] = useState(false);
	const [historyOpen, setHistoryOpen] = useState(false);

	const onInvoice = useCallback(() => {
		if (!order) return;
		notifications.show({
			color: 'blue',
			title: translate('coremart.vendingMachine.orders.invoice.pending_title'),
			message: translate('coremart.vendingMachine.orders.invoice.pending_message', { id: order.orderCode }),
		});
	}, [order, translate]);

	const { breadcrumbs, actions } = useOrderDetailPageConfig({
		order,
		onRefund: () => setRefundOpen(true),
		onInvoice,
		onHistory: () => setHistoryOpen(true),
	});

	const title = <TextCopyable value={order?.orderCode ?? ''} copyable fw={500}>
		<Trans i18nKey={'coremart.vendingMachine.orders.detail.title'} values={{ id: order?.orderCode }} />
	</TextCopyable>;

	const subtitle = order
		? translate('coremart.vendingMachine.orders.detail.subtitle', {
			created: new Date(order.createdAt).toLocaleString(),
		})
		: '';

	return (
		<PageContainer
			documentTitle={order?.orderCode ?? ''}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='order-detail-actions' actions={actions} />]}
			isLoading={isLoading && !order}
			isNotFound={!order && !isLoading}
			notFoundContent={<OrderNotFound />}
		>
			{order && (
				<DetailLayout
					header={{
						title,
						subtitle,
						avatar: <IconReceipt size={46} stroke={1.5} />,
					}}
					tabs={[{
						id: 'detail',
						title: '',
						content: () => <OrderDetailContent order={order} />,
					}]}
				/>
			)}
			<OrderRefundModal
				opened={refundOpen}
				onClose={() => setRefundOpen(false)}
				orderId={order?.id ?? null}
			/>
			<OrderHistoryModal
				opened={historyOpen}
				onClose={() => setHistoryOpen(false)}
				orderId={order?.id ?? null}
			/>
		</PageContainer>
	);
};
