import { Card, SimpleGrid, Skeleton, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, fmtNumber } from '../../../../../common/helpers';

import type { RefundOverview } from './type';


type RefundReportSummaryProps = {
	overview: RefundOverview | null,
	isLoading: boolean,
};

function KpiCard({ label, value, isLoading }: { label: string, value: string, isLoading: boolean }) {
	return (
		<Card withBorder padding='md' radius='md' shadow='xs'>
			<Text size='xs' c='dimmed' tt='uppercase' fw={600}>{label}</Text>
			{isLoading ? (
				<Skeleton height={28} mt={4} radius='sm' />
			) : (
				<Text size='xl' fw={700} mt={4}>{value}</Text>
			)}
		</Card>
	);
}

export function RefundReportSummary({ overview, isLoading }: RefundReportSummaryProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const totalRefundAmount = overview ? fmtCurrency(Math.abs(Number(overview.totalRefundAmount))) : '—';
	const refundedOrderCount = overview ? fmtNumber(overview.refundedOrderCount) : '0';
	const totalOrderCount = overview ? Number(overview.totalOrderCount) : 0;
	const orderRefundRate = overview && totalOrderCount > 0
		? Math.round((Number(overview.refundedOrderCount) / totalOrderCount) * 100)
		: 0;
	const refundedProductCount = overview ? fmtNumber(overview.refundedProductCount) : '—';
	const productRefundRate = overview ? fmtNumber(overview.refundRateByProduct) : '—';

	return (
		<SimpleGrid cols={{ base: 1, xs: 2, lg: 5 }} spacing='md'>
			<KpiCard
				label={translate('reports.refund_report.summary.total_refund_amount')}
				value={totalRefundAmount ?? '0'}
				isLoading={isLoading}
			/>
			<KpiCard
				label={translate('reports.refund_report.summary.refund_order_count')}
				value={refundedOrderCount ?? '0'}
				isLoading={isLoading}
			/>
			<KpiCard
				label={translate('reports.refund_report.summary.order_refund_rate')}
				value={orderRefundRate ? `${orderRefundRate}%` : '0%'}
				isLoading={isLoading}
			/>
			<KpiCard
				label={translate('reports.refund_report.summary.refunded_product_qty')}
				value={refundedProductCount ?? '0'}
				isLoading={isLoading}
			/>
			<KpiCard
				label={translate('reports.refund_report.summary.product_refund_rate')}
				value={productRefundRate ? `${productRefundRate}%` : '0%'}
				isLoading={isLoading}
			/>
		</SimpleGrid>
	);
}

