import { Alert, SimpleGrid, Skeleton, Stack } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, fmtNumber } from '../../../../../common/helpers';
import { useRevenueReportByHour, useRevenueReportByOrderTime, useRevenueReportOverview, useRevenueTimeSeriesChart } from '../../hooks';
import { RevenueByHourChart } from '../RevenueByHourChart';
import { RevenueTimeSeriesChart, RevenueTimeSeriesTable } from '../RevenueTimeSeries';
import { SummaryMetricCard } from './SummaryMetricCard';

import type { RevenueReportFilters } from '../RevenueReportSwitcher/type';



function SummaryRevenueOverview({ filters }: { filters: RevenueReportFilters }): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');
	const { data: summaryValues, isLoading, error } = useRevenueReportOverview(filters);

	if (isLoading) return <Skeleton height={100} />;
	if (error) {
		return (
			<Alert color='red.4' bg='red.0' mih={100}
				title={translate('reports.revenue.title')}>
				{error ?? 'Failed to load revenue overview'}
			</Alert>
		);
	}

	return (
		<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing='md' mih={100}>
			<SummaryMetricCard
				label={translate('reports.revenue_report.summary.total_orders')}
				value={fmtNumber(summaryValues?.orderCount ?? 0) ?? '—'}
			/>
			<SummaryMetricCard
				label={translate('reports.revenue_report.summary.total_items_sold')}
				value={fmtNumber(summaryValues?.totalItemCount ?? 0) ?? '—'}
			/>
			<SummaryMetricCard
				label={translate('reports.revenue_report.summary.total_revenue')}
				value={fmtCurrency(summaryValues?.totalRevenue ?? 0) ?? '—'}
			/>
			<SummaryMetricCard
				label={translate('reports.revenue_report.summary.total_refund')}
				value={fmtCurrency(summaryValues?.totalRefund ?? 0) ?? '—'}
			/>
		</SimpleGrid>
	);
}


export function RevenueReportOverview({ filters }: { filters: RevenueReportFilters }): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const { items: hourlyReportItems } = useRevenueReportByHour(filters);
	const {
		overview: timeSeriesChartOverview,
		items: timeSeriesChartItems,
		pagination: chartPagination,
		isLoading: chartIsLoading,
		groupTime: timeSeriesChartGroupTime,
	} = useRevenueTimeSeriesChart(filters);

	const {
		items: orderTimeReportItems,
		pagination: orderTimeReportPagination,
		handleExport: orderTimeReportHandleExport,
		groupTime: orderTimeReportGroupTime,
	} = useRevenueReportByOrderTime(filters);

	return (
		<Stack gap='md'>
			<SummaryRevenueOverview filters={filters} />
			<RevenueTimeSeriesChart
				overview={timeSeriesChartOverview}
				items={timeSeriesChartItems}
				pagination={chartPagination}
				isLoading={chartIsLoading}
				groupTime={timeSeriesChartGroupTime}
				title={translate('reports.revenue_report.chart.revenue_overview')}
				subtitle={translate('reports.revenue_report.chart.revenue_overview_hint')}
			/>
			<RevenueByHourChart
				data={hourlyReportItems ?? []}
				title={translate('reports.revenue_report.chart.by_hour')}
			/>
			<RevenueTimeSeriesTable
				data={orderTimeReportItems ?? []}
				pagination={orderTimeReportPagination}
				handleExport={orderTimeReportHandleExport}
				groupTime={orderTimeReportGroupTime}
			/>
		</Stack>
	);
}
