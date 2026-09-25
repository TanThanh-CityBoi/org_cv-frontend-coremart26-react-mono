/* eslint-disable max-lines-per-function */

import { Button, Group, Text, Title } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDownload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, fmtNumber } from '@/common/helpers';
import { PaginationConfig } from '@/common/hooks/usePagination';
import { TableContainer, TablePagination } from '@/components/Table';
import { formatOrderTimeLabel } from '@/features/reports/helpers';
import { GroupTime } from '@/types/api';

import type { RevenueReportByOrderTime } from '@/features/reports/business/type';


dayjs.extend(customParseFormat);


const REVENUE_OVERVIEW_DETAIL_COLUMNS = [
	'orderTime',
	'orderCount',
	'cancelledOrderCount',
	'refundedOrderCount',
	'totalItemCount',
	'totalSuccessItemCount',
	'totalRevenue',
	'averageRevenue',
	'totalRefund',
] as const;

type DetailColumnKey = (typeof REVENUE_OVERVIEW_DETAIL_COLUMNS)[number];


const TABLE_SCHEMA: ModelSchema = {
	name: 'RevenueOverviewOrderTimeDetail',
	fields: {
		orderTime: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.orderTime' },
		orderCount: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.orderCount' },
		cancelledOrderCount: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.cancelledOrderCount' },
		refundedOrderCount: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.refundedOrderCount' },
		totalItemCount: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.totalItemCount' },
		totalSuccessItemCount: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.totalSuccessItemCount' },
		totalRevenue: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.totalRevenue' },
		averageRevenue: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.averageRevenue' },
		totalRefund: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.totalRefund' },
	},
};

interface RevenueTimeSeriesTableProps {
	data: RevenueReportByOrderTime[];
	groupTime?: GroupTime;
	isLoading?: boolean;
	pagination?: PaginationConfig;
	handleExport?: () => void;
}
export function RevenueTimeSeriesTable({
	data,
	isLoading,
	pagination,
	handleExport,
	groupTime = 'day',
}: RevenueTimeSeriesTableProps): React.ReactElement {
	const { t: translate, i18n } = useTranslation();

	const colAlignEndKeys = new Set<DetailColumnKey>([
		'orderCount',
		'cancelledOrderCount',
		'refundedOrderCount',
		'totalItemCount',
		'totalSuccessItemCount',
		'totalRevenue',
		'averageRevenue',
		'totalRefund',
	]);

	const formattedDetailRows = useMemo((): Record<string, unknown>[] => {
		return data?.map((row: RevenueReportByOrderTime) => ({
			orderTime: formatOrderTimeLabel(row.orderTime, groupTime, i18n.language, translate),
			orderCount: fmtNumber(row.orderCount) ?? '—',
			cancelledOrderCount: fmtNumber(row.cancelledOrderCount) ?? '—',
			refundedOrderCount: fmtNumber(row.refundedOrderCount) ?? '—',
			totalItemCount: fmtNumber(row.totalItemCount) ?? '—',
			totalSuccessItemCount: fmtNumber(row.totalSuccessItemCount) ?? '—',
			totalRevenue: fmtCurrency(row.totalRevenue) ?? '—',
			averageRevenue: fmtCurrency(row.averageRevenue) ?? '—',
			totalRefund: fmtCurrency(row.totalRefund) ?? '—',
		}));
	}, [data, i18n.language, translate]);

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = Object.fromEntries(
		REVENUE_OVERVIEW_DETAIL_COLUMNS.map((colKey) => [
			colKey,
			(row: Record<string, unknown>) => (
				<Text size='sm' ta={colAlignEndKeys.has(colKey) ? 'end' : 'start'}>
					{String(row[colKey] ?? '—')}
				</Text>
			),
		]),
	) as React.ComponentProps<typeof AutoTable>['columnRenderers'];

	const headerAlignEndKeys = colAlignEndKeys;
	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = Object.fromEntries(
		REVENUE_OVERVIEW_DETAIL_COLUMNS.map((colKey) => [
			colKey,
			() => (
				<Text fw={600} fz='sm' ta={headerAlignEndKeys.has(colKey) ? 'end' : 'start'}>
					{translate(`coremart.vendingMachine.reports.revenueReport.columns.${colKey}`)}
				</Text>
			),
		]),
	) as React.ComponentProps<typeof AutoTable>['headerRenderers'];

	return (
		<TableContainer
			minWidth={960}
			withBorder shadow='sm'
			unstyledScrollContainer
			header={
				<Group justify='space-between' align='flex-start' wrap='nowrap' mb={6}>
					<Title order={4} fw={600}>
						{translate('coremart.vendingMachine.reports.revenueReport.detailTable')}
					</Title>
					<Button
						size='sm'
						leftSection={<IconDownload size={16} />}
						onClick={handleExport}
					>
						{translate('coremart.vendingMachine.reports.revenueReport.export')}
					</Button>
				</Group>
			}
			footer={<TablePagination {...pagination} />}
		>
			<AutoTable
				columns={[...REVENUE_OVERVIEW_DETAIL_COLUMNS]}
				data={formattedDetailRows}
				schema={TABLE_SCHEMA}
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
