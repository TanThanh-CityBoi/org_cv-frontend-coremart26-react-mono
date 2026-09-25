/* eslint-disable max-lines-per-function */

import { Alert, Button, Grid, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDownload } from '@tabler/icons-react';
import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PaymentMethodMetricBarChart } from './PaymentMethodMetricBarChart';
import { PaymentMethodRevenueDoughnutChart } from './PaymentMethodRevenueDoughnutChart';
import { asLegacyModelSchema, fmtCurrency, fmtNumber } from '../../../../../common/helpers';
import { TableContainer, TablePagination } from '../../../../../components/Table';
import { useRevenueReportByPaymentMethod, useRevenueReportByPaymentMethodChart } from '../../hooks';

import type { PaymentMethodMetricRow } from './PaymentMethodMetricBarChart';
import type { RevenueReportByPaymentMethod } from '../../type';
import type { RevenueReportFilters } from '../RevenueReportSwitcher/type';


const BY_PAYMENT_COLUMNS = ['method', 'orders', 'revenue'] as const;

const byPaymentSchema = asLegacyModelSchema({
	name: 'RevenueByPayment',
	fields: {
		method: { type: 'string', label: 'reports.revenue_report.columns.payment_method' },
		orders: { type: 'string', label: 'reports.revenue_report.columns.orders' },
		refund: { type: 'string', label: 'reports.revenue_report.columns.refund' },
		revenue: { type: 'string', label: 'reports.revenue_report.columns.revenue' },
	},
});

function mapPaymentRowsToTableData(rows: RevenueReportByPaymentMethod[]): Record<string, unknown>[] {
	return rows.map((row) => ({
		method: row.name,
		orders: fmtNumber(row.orderCount) ?? '—',
		revenue: fmtCurrency(row.totalRevenue) ?? '—',
	}));
}

function mapPaymentRowsToChartData(rows: RevenueReportByPaymentMethod[]): PaymentMethodMetricRow[] {
	return rows.map((row) => ({
		paymentMethodId: row.paymentMethod,
		label: row.name,
		revenue: Number(row.totalRevenue) || 0,
		orders: row.orderCount,
	}));
}

export function RevenueReportByPayment({ filters }: { filters: RevenueReportFilters }): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const {
		items: tableItems,
		pagination,
		isLoading: tableIsLoading,
		error: tableError,
		handleExport,
	} = useRevenueReportByPaymentMethod(filters);

	const {
		items: chartItems,
		isLoading: chartIsLoading,
		error: chartError,
	} = useRevenueReportByPaymentMethodChart(filters);

	const tableData = useMemo(() => mapPaymentRowsToTableData(tableItems), [tableItems]);
	const chartData = useMemo(() => mapPaymentRowsToChartData(chartItems), [chartItems]);

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		method: (row) => <Text size='sm'>{String(row.method ?? '—')}</Text>,
		orders: (row) => <Text size='sm' ta='end'>{String(row.orders ?? '—')}</Text>,
		revenue: (row) => <Text size='sm' ta='end'>{String(row.revenue ?? '—')}</Text>,
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		orders: () => <Text fw={600} fz='sm' ta='end'>{translate('reports.revenue_report.columns.orders')}</Text>,
		revenue: () => <Text fw={600} fz='sm' ta='end'>{translate('reports.revenue_report.columns.revenue')}</Text>,
	};

	const chartSection = chartIsLoading ? (
		<Skeleton height={320} radius='md' />
	) : chartError ? (
		<Alert color='red.4' bg='red.0' mih={200}
			title={translate('reports.revenue_report.chart.by_payment')}>
			{chartError}
		</Alert>
	) : (
		<Grid gap='md'>
			<Grid.Col span={{ base: 12, lg: 6 }}>
				<PaymentMethodMetricBarChart
					data={chartData}
					title={translate('reports.revenue_report.chart.by_payment')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 12, lg: 6 }}>
				<PaymentMethodRevenueDoughnutChart
					data={chartData}
					title={translate('reports.revenue_report.chart.revenue_share_by_payment')}
				/>
			</Grid.Col>
		</Grid>
	);

	return (
		<Stack gap='md'>
			{chartSection}
			<TableContainer
				minWidth={560}
				withBorder
				shadow='sm'
				unstyledScrollContainer
				header={
					<Group justify='space-between' align='flex-start' wrap='nowrap' mb={6}>
						<Title order={4} fw={600}>
							{translate('reports.revenue_report.detail_table')}
						</Title>
						<Button
							size='sm'
							leftSection={<IconDownload size={16} />}
							onClick={handleExport}
						>
							{translate('reports.revenue_report.export')}
						</Button>
					</Group>
				}
				footer={<TablePagination {...pagination} />}
			>
				<Stack gap='sm'>
					{tableError ? (
						<Alert color='red.4' bg='red.0'>
							{tableError}
						</Alert>
					) : (

						<AutoTable
							translationNs='vending_machine'
							columns={[...BY_PAYMENT_COLUMNS]}
							data={tableData}
							schema={byPaymentSchema}
							isLoading={tableIsLoading}
							columnRenderers={colRenderers}
							headerRenderers={headerRenderers}
							striped='even'
							highlightOnHover
							theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
						/>
					)}
				</Stack>
			</TableContainer>
		</Stack>
	);
}
