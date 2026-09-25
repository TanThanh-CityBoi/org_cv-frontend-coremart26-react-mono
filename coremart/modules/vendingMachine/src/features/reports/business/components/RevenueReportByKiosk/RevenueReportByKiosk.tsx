/* eslint-disable max-lines-per-function */

import { Alert, Anchor, Button, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDownload } from '@tabler/icons-react';
import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { RevenueByKioskBarChart } from './RevenueByKioskBarChart';
import { asLegacyModelSchema, fmtCurrency, fmtNumber } from '../../../../../common/helpers';
import { TableContainer, TablePagination } from '../../../../../components/Table';
import { useRevenueReportByKiosk, useRevenueReportByKioskChart } from '../../hooks';

import type { RevenueReportByKiosk as RevenueReportByKioskRow } from '../../type';
import type { RevenueReportFilters } from '../RevenueReportSwitcher/type';


const BY_KIOSK_COLUMNS = ['kiosk', 'orders', 'productsSold', 'refund', 'revenue'] as const;

const byKioskSchema = asLegacyModelSchema({
	name: 'RevenueByKiosk',
	fields: {
		kiosk: { type: 'string', label: 'reports.revenue_report.columns.kiosk' },
		orders: { type: 'string', label: 'reports.revenue_report.columns.orders' },
		productsSold: { type: 'string', label: 'reports.revenue_report.columns.products_sold' },
		refund: { type: 'string', label: 'reports.revenue_report.columns.refund' },
		revenue: { type: 'string', label: 'reports.revenue_report.columns.revenue' },
	},
});

function mapKioskRowsToTableData(rows: RevenueReportByKioskRow[]): Record<string, unknown>[] {
	return rows.map((row) => ({
		kioskId: row.kioskId,
		kiosk: row.kioskName,
		orders: fmtNumber(row.orderCount) ?? '—',
		productsSold: fmtNumber(row.totalItemCount) ?? '—',
		refund: fmtCurrency(row.totalRefund) ?? '—',
		revenue: fmtCurrency(row.totalRevenue) ?? '—',
	}));
}


export function RevenueReportByKiosk({ filters }: { filters: RevenueReportFilters }): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const {
		items: tableItems,
		pagination,
		isLoading: tableIsLoading,
		error: tableError,
		handleExport,
	} = useRevenueReportByKiosk(filters);

	const {
		items: chartItems,
		isLoading: chartIsLoading,
		error: chartError,
	} = useRevenueReportByKioskChart(filters);

	const tableData = useMemo(() => mapKioskRowsToTableData(tableItems), [tableItems]);
	// const chartData = useMemo(() => mapKioskRowsToChartData(chartItems), [chartItems]);

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		kiosk: (row) => (
			<Anchor
				component={Link}
				to={`../reports/kiosk?id=${encodeURIComponent(String(row.kioskId ?? ''))}`}
				size='sm'
			>
				{String(row.kiosk ?? '—')}
			</Anchor>
		),
		orders: (row) => <Text size='sm' ta='end'>{String(row.orders ?? '—')}</Text>,
		productsSold: (row) => <Text size='sm' ta='end'>{String(row.productsSold ?? '—')}</Text>,
		refund: (row) => <Text size='sm' ta='end'>{String(row.refund ?? '—')}</Text>,
		revenue: (row) => <Text size='sm' ta='end'>{String(row.revenue ?? '—')}</Text>,
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		orders: () => <Text fw={600} fz='sm' ta='end'>{translate('reports.revenue_report.columns.orders')}</Text>,
		productsSold: () => <Text fw={600} fz='sm' ta='end'>{translate('reports.revenue_report.columns.products_sold')}</Text>,
		refund: () => <Text fw={600} fz='sm' ta='end'>{translate('reports.revenue_report.columns.refund')}</Text>,
		revenue: () => <Text fw={600} fz='sm' ta='end'>{translate('reports.revenue_report.columns.revenue')}</Text>,
	};

	return (
		<Stack gap='md'>
			{chartIsLoading ? (
				<Skeleton height={400} radius='md' />
			) : chartError ? (
				<Alert color='red.4' bg='red.0' mih={200}
					title={translate('reports.revenue_report.chart.by_kiosk')}>
					{chartError}
				</Alert>
			) : (
				<RevenueByKioskBarChart
					data={chartItems}
					title={translate('reports.revenue_report.chart.by_kiosk')}
				/>
			)}

			<TableContainer minWidth={640}
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
							disabled={tableIsLoading || !pagination.totalItems}
							onClick={handleExport}
						>
							{translate('reports.revenue_report.export')}
						</Button>
					</Group>
				}
				footer={<TablePagination {...pagination} />}
			>
				{tableError ? (
					<Alert color='red.4' bg='red.0'>
						{tableError}
					</Alert>
				) : (
					<AutoTable
						translationNs='vending_machine'
						columns={[...BY_KIOSK_COLUMNS]}
						data={tableData}
						schema={byKioskSchema}
						isLoading={tableIsLoading}
						columnRenderers={colRenderers}
						headerRenderers={headerRenderers}
						striped='even'
						highlightOnHover
						theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
					/>
				)}
			</TableContainer>
		</Stack>
	);
}
