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

import { fmtCurrency, fmtNumber } from '@/common/helpers';
import { TableContainer, TablePagination } from '@/components/Table';

import { RevenueByKioskBarChart } from './RevenueByKioskBarChart';
import { useRevenueReportByKiosk, useRevenueReportByKioskChart } from '../../hooks';

import type { RevenueReportFilters } from '../RevenueReportSwitcher/type';
import type { RevenueReportByKiosk as RevenueReportByKioskRow } from '@/features/reports/business/type';


const BY_KIOSK_COLUMNS = ['kiosk', 'orders', 'productsSold', 'refund', 'revenue'] as const;

const byKioskSchema: ModelSchema = {
	name: 'RevenueByKiosk',
	fields: {
		kiosk: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.kiosk' },
		orders: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.orders' },
		productsSold: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.productsSold' },
		refund: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.refund' },
		revenue: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.revenue' },
	},
};

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
	const { t: translate } = useTranslation();

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
		orders: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.revenueReport.columns.orders')}</Text>,
		productsSold: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.revenueReport.columns.productsSold')}</Text>,
		refund: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.revenueReport.columns.refund')}</Text>,
		revenue: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.revenueReport.columns.revenue')}</Text>,
	};

	return (
		<Stack gap='md'>
			{chartIsLoading ? (
				<Skeleton height={400} radius='md' />
			) : chartError ? (
				<Alert color='red.4' bg='red.0' mih={200}
					title={translate('coremart.vendingMachine.reports.revenueReport.chart.byKiosk')}>
					{chartError}
				</Alert>
			) : (
				<RevenueByKioskBarChart
					data={chartItems}
					title={translate('coremart.vendingMachine.reports.revenueReport.chart.byKiosk')}
				/>
			)}

			<TableContainer minWidth={640}
				withBorder
				shadow='sm'
				unstyledScrollContainer
				header={
					<Group justify='space-between' align='flex-start' wrap='nowrap' mb={6}>
						<Title order={4} fw={600}>
							{translate('coremart.vendingMachine.reports.revenueReport.detailTable')}
						</Title>
						<Button
							size='sm'
							leftSection={<IconDownload size={16} />}
							disabled={tableIsLoading || !pagination.totalItems}
							onClick={handleExport}
						>
							{translate('coremart.vendingMachine.reports.revenueReport.export')}
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
