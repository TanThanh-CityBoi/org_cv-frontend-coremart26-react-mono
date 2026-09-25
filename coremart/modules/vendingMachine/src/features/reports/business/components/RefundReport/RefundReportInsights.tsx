import { Alert, Grid, Skeleton, Stack } from '@mantine/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


import { RefundMethodRateChart } from './RefundMethodRateChart';
import { RefundReportSummary } from './RefundReportSummary';
import { RefundTopKiosksBarChart } from './RefundTopKiosksBarChart';
import { RefundTopProductsBarChart } from './RefundTopProductsBarChart';
import { getLocalizedName } from '../../../../../common/helpers';
import {
	useRefundByKiosk,
	useRefundByPaymentMethod,
	useRefundByProduct,
	useRefundOverview,
} from '../../hooks';

import type { MethodRefundRateRow, ProductRefundBreakdown, KioskRefundBreakdown, KioskRefundReport, PaymentMethodRefundReport, ProductRefundReport, RefundReportAppliedFilters } from './type';


type RefundReportInsightsProps = {
	applied: RefundReportAppliedFilters,
};

export function RefundReportInsights({ applied }: RefundReportInsightsProps): React.ReactElement {
	const { t: translate, i18n } = useTranslation('vending_machine');

	const { data: overview, isLoading: overviewLoading, error: overviewError } = useRefundOverview(applied);
	const { items: kioskItems, isLoading: kioskLoading, error: kioskError } = useRefundByKiosk(applied);
	const { items: pmItems, isLoading: pmLoading, error: pmError } = useRefundByPaymentMethod(applied);
	const { items: productItems, isLoading: productLoading, error: productError } = useRefundByProduct(applied);

	const kioskRows = useMemo((): KioskRefundBreakdown[] => kioskItems.map((r: KioskRefundReport) => ({
		kioskName: r.kioskName,
		refundAmount: Math.abs(Number(r.refundAmount)),
		refundOrders: r.refundedOrderCount,
	})), [kioskItems]);

	const methodRows = useMemo((): MethodRefundRateRow[] => pmItems.map((r: PaymentMethodRefundReport) => ({
		label: r.name,
		refundAmount: Math.abs(Number(r.refundAmount)),
	})), [pmItems]);

	const productRows = useMemo((): ProductRefundBreakdown[] => productItems.map((r: ProductRefundReport) => ({
		productName: getLocalizedName(r.productName, i18n.language),
		refundAmount: Math.abs(Number(r.refundAmount)),
		quantity: r.refundedOrderCount,
	})), [productItems, i18n.language]);

	return (
		<Stack gap='lg'>
			<RefundReportSummary overview={overview} isLoading={overviewLoading} />
			{overviewError && (
				<Alert color='red.4' bg='red.0'>
					{overviewError}
				</Alert>
			)}

			<Grid gap='md'>
				<Grid.Col span={{ base: 12, lg: 6 }}>
					{kioskLoading ? (
						<Skeleton height={340} radius='md' />
					) : kioskError ? (
						<Alert color='red.4' bg='red.0'>
							{kioskError}
						</Alert>
					) : (
						<RefundTopKiosksBarChart
							data={kioskRows}
							title={translate('reports.refund_report.charts.top_kiosks')}
						/>
					)}
				</Grid.Col>
				<Grid.Col span={{ base: 12, lg: 6 }}>
					{pmLoading ? (
						<Skeleton height={340} radius='md' />
					) : pmError ? (
						<Alert color='red.4' bg='red.0'>
							{pmError}
						</Alert>
					) : (
						<RefundMethodRateChart
							rows={methodRows}
							title={translate('reports.refund_report.charts.refund_rate_by_method')}
						/>
					)}
				</Grid.Col>
				<Grid.Col span={12}>
					{productLoading ? (
						<Skeleton height={340} radius='md' />
					) : productError ? (
						<Alert color='red.4' bg='red.0'>
							{productError}
						</Alert>
					) : (
						<RefundTopProductsBarChart
							data={productRows}
							title={translate('reports.refund_report.charts.top_products')}
						/>
					)}
				</Grid.Col>
			</Grid>
		</Stack>
	);
}
