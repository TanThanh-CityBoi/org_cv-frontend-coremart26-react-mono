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

import { asLegacyModelSchema, fmtCurrency, fmtNumber } from '../../../../../common/helpers';
import { PaginationConfig } from '../../../../../common/hooks/usePagination';
import { TableContainer, TablePagination } from '../../../../../components/Table';
import { GroupTime } from '../../../../../types/api';
import { formatOrderTimeLabel } from '../../../helpers';

import type { RevenueReportByOrderTime } from '../../type';


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


const TABLE_SCHEMA = asLegacyModelSchema({
	name: 'RevenueOverviewOrderTimeDetail',
	fields: {
		orderTime: { type: 'string', label: 'reports.revenue_report.columns.order_time' },
		orderCount: { type: 'string', label: 'reports.revenue_report.columns.order_count' },
		cancelledOrderCount: { type: 'string', label: 'reports.revenue_report.columns.cancelled_order_count' },
		refundedOrderCount: { type: 'string', label: 'reports.revenue_report.columns.refunded_order_count' },
		totalItemCount: { type: 'string', label: 'reports.revenue_report.columns.total_item_count' },
		totalSuccessItemCount: { type: 'string', label: 'reports.revenue_report.columns.total_success_item_count' },
		totalRevenue: { type: 'string', label: 'reports.revenue_report.columns.total_revenue' },
		averageRevenue: { type: 'string', label: 'reports.revenue_report.columns.average_revenue' },
		totalRefund: { type: 'string', label: 'reports.revenue_report.columns.total_refund' },
	},
});

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
	const { t: translate, i18n } = useTranslation('vending_machine');

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
					{translate(`reports.revenue_report.columns.${colKey}`)}
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
			<AutoTable
				translationNs='vending_machine'
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
