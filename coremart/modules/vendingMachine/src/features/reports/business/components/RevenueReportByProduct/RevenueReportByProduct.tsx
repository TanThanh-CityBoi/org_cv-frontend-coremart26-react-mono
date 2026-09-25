import { Alert, Grid, Skeleton, Stack } from '@mantine/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


import { mapCategoryRowsToBarChart, ProductCategoryBarChart } from './ProductCategoryBarChart';
import { ProductRevenueBarChart } from './ProductRevenueBarChart';
import { ProductRevenueTable } from './ProductRevenueTable';
import { getLocalizedName } from '../../../../../common/helpers';
import {
	useRevenueReportByCategoryChart,
	useRevenueReportByProduct,
	useRevenueReportByProductChart,
} from '../../hooks';

import type { ProductRevenueRow } from './ProductRevenueBarChart';
import type { RevenueReportByProduct as RevenueReportByProductRow } from '../../type';
import type { RevenueReportFilters } from '../RevenueReportSwitcher/type';


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
	const { t: translate, i18n } = useTranslation('vending_machine');

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
					title={translate('reports.revenue_report.chart.top_products_by_revenue')}>
					{chartsError}
				</Alert>
			) : (
				<Grid gap='md'>
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<ProductRevenueBarChart
							data={barChartData}
							maxItems={10}
							title={translate('reports.revenue_report.chart.top_products_by_revenue')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<ProductCategoryBarChart
							data={categoryBarData}
							maxCategories={10}
							title={translate('reports.revenue_report.chart.by_category')}
						/>
					</Grid.Col>
				</Grid>
			)}

			<ProductRevenueTable
				title={translate('reports.revenue_by_product.table_title')}
				description={translate('reports.revenue_by_product.table_description')}
				items={tableItems}
				pagination={pagination}
				isLoading={tableIsLoading}
				error={tableError}
				handleExport={handleExport}
			/>
		</Stack>
	);
}
