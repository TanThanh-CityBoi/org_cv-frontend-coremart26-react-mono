import { Alert, Grid, Skeleton, Stack } from '@mantine/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocalizedName } from '@/common/helpers';

import { mapCategoryRowsToBarChart, ProductCategoryBarChart } from './ProductCategoryBarChart';
import { ProductRevenueBarChart } from './ProductRevenueBarChart';
import { ProductRevenueTable } from './ProductRevenueTable';
import {
	useRevenueReportByCategoryChart,
	useRevenueReportByProduct,
	useRevenueReportByProductChart,
} from '../../hooks';

import type { ProductRevenueRow } from './ProductRevenueBarChart';
import type { RevenueReportFilters } from '../RevenueReportSwitcher/type';
import type { RevenueReportByProduct as RevenueReportByProductRow } from '@/features/reports/business/type';


function mapProductRowsToBarChart(
	rows: RevenueReportByProductRow[],
	language: string,
): ProductRevenueRow[] {
	return rows.map((row) => ({
		productLabel: getLocalizedName(row.productName, language) || row.productId,
		revenue: Number(row.totalRevenue) || 0,
	}));
}


export function RevenueReportByProduct({ filters }: { filters: RevenueReportFilters }): React.ReactElement {
	const { t: translate, i18n } = useTranslation();

	const {
		items: tableItems,
		pagination,
		isLoading: tableIsLoading,
		error: tableError,
		handleExport,
	} = useRevenueReportByProduct(filters);

	const {
		items: productChartItems,
		isLoading: productChartIsLoading,
		error: productChartError,
	} = useRevenueReportByProductChart(filters);

	const {
		items: categoryChartItems,
		isLoading: categoryChartIsLoading,
		error: categoryChartError,
	} = useRevenueReportByCategoryChart(filters);

	const barChartData = useMemo(
		() => mapProductRowsToBarChart(productChartItems, i18n.language),
		[productChartItems, i18n.language],
	);

	const categoryBarData = useMemo(
		() => mapCategoryRowsToBarChart(categoryChartItems, i18n.language),
		[categoryChartItems, i18n.language],
	);

	const chartsLoading = productChartIsLoading || categoryChartIsLoading;
	const chartsError = productChartError ?? categoryChartError;

	return (
		<Stack gap='md'>
			{chartsLoading ? (
				<Skeleton height={360} radius='md' />
			) : chartsError ? (
				<Alert color='red.4' bg='red.0' mih={200}
					title={translate('coremart.vendingMachine.reports.revenueReport.chart.topProductsByRevenue')}>
					{chartsError}
				</Alert>
			) : (
				<Grid gutter='md'>
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<ProductRevenueBarChart
							data={barChartData}
							maxItems={10}
							title={translate('coremart.vendingMachine.reports.revenueReport.chart.topProductsByRevenue')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<ProductCategoryBarChart
							data={categoryBarData}
							maxCategories={10}
							title={translate('coremart.vendingMachine.reports.revenueReport.chart.byCategory')}
						/>
					</Grid.Col>
				</Grid>
			)}

			<ProductRevenueTable
				title={translate('coremart.vendingMachine.reports.revenueByProduct.tableTitle')}
				description={translate('coremart.vendingMachine.reports.revenueByProduct.tableDescription')}
				items={tableItems}
				pagination={pagination}
				isLoading={tableIsLoading}
				error={tableError}
				handleExport={handleExport}
			/>
		</Stack>
	);
}
