/* eslint-disable max-lines-per-function */
import { Anchor, Stack, Title } from '@mantine/core';
import { DateValue, DatesRangeValue } from '@mantine/dates';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';

import { asLegacyModelSchema } from '../../common/helpers';
import { StickyFilterBar, type ControlPanelFilterConfig } from '../../components';
import { controlPanelToSearchGraph } from '../../components/ControlPanel/controlPanelToSearchGraph';
import { PageContainer } from '../../components/PageContainer';
import { ORDER_TABLE_COLUMNS, orderSchema, OrderTable, useOrderList } from '../../features/orders';
import { ProductRevenueTable } from '../../features/reports/business/components/RevenueReportByProduct';
import { RevenueReportFilters } from '../../features/reports/business/components/RevenueReportSwitcher/type';
import { useRevenueReportByProduct } from '../../features/reports/business/hooks/useRevenueReportQueries';



type KioskRevenueDetailBodyProps = {
	filters: Pick<RevenueReportFilters, 'dateRange' | 'timeSlot' | 'kioskIds'>,
};

function KioskRevenueDetailBody({
	filters,
}: KioskRevenueDetailBodyProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const {
		items: productTableItems,
		pagination: productTablePagination,
		isLoading: productTableIsLoading,
		error: productTableError,
		handleExport: productTableHandleExport,
	} = useRevenueReportByProduct(filters);

	const orderGraph = useMemo(() => {
		const graph = controlPanelToSearchGraph([
			{
				key: 'kiosk_ref',
				type: 'select',
				value: filters.kioskIds,
				options: [],
				onChange: () => {},
			},
			{
				key: 'created_at',
				type: 'dateRange',
				onChange: () => {},
				value: filters.dateRange,
			},
		]);
		return graph;
	}, [filters.kioskIds, filters.dateRange]);

	const {
		orders: orderItems,
		pagination: orderPagination,
		isLoading: orderIsLoading,
	} = useOrderList(orderGraph);


	return (
		<Stack gap='lg'>
			<OrderTable
				tableTitle={translate('reports.revenue_report.kiosk_revenue_detail.orders_section')}
				columns={[...ORDER_TABLE_COLUMNS.filter((column) => column !== 'actions')]}
				data={orderItems}
				schema={asLegacyModelSchema(orderSchema)}
				actions={{}}
				isLoading={orderIsLoading}
				pagination={orderPagination}
				containerProps={{
					shadow: 'sm',
					unstyledScrollContainer: true,
					withBorder: true,
					minWidth: 960,
				}}
			/>

			<ProductRevenueTable
				title={translate('reports.revenue_report.kiosk_revenue_detail.product_revenue_section')}
				items={productTableItems}
				pagination={productTablePagination}
				isLoading={productTableIsLoading}
				error={productTableError}
				handleExport={productTableHandleExport}
			/>
		</Stack>
	);
}

export const KioskRevenueDetailPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const [searchParams] = useSearchParams();
	const kioskRef = searchParams.get('id')?.trim() ?? '';

	const defaultRange = useMemo((): DatesRangeValue<DateValue> => [
		dayjs().startOf('month').toDate(),
		dayjs().endOf('day').toDate(),
	], []);

	const [draftDateRange, setDraftDateRange] = useState<DatesRangeValue<DateValue> | undefined>(defaultRange);
	const [draftTimeSlot, setDraftTimeSlot] = useState<{ from: string | null, to: string | null }>({
		from: null,
		to: null,
	});
	const [appliedDateRange, setAppliedDateRange] = useState<DatesRangeValue<DateValue> | undefined>(defaultRange);
	const [appliedTimeSlot, setAppliedTimeSlot] = useState<{ from: string | null, to: string | null }>({
		from: null,
		to: null,
	});

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'period',
			type: 'dateRange',
			value: draftDateRange,
			onChange: setDraftDateRange,
			placeholder: translate('common.date_picker.select_date_range'),
			clearable: true,
		},
		{
			key: 'timeSlot',
			type: 'timeSlot',
			value: draftTimeSlot,
			onChange: setDraftTimeSlot,
			clearable: true,
		},
	], [draftDateRange, draftTimeSlot, translate]);

	const handleApply = useCallback(() => {
		setAppliedDateRange(draftDateRange);
		setAppliedTimeSlot(draftTimeSlot);
	}, [draftDateRange, draftTimeSlot]);

	const reportFilters = useMemo(() => ({
		dateRange: appliedDateRange,
		timeSlot: appliedTimeSlot,
		kioskIds: [kioskRef],
	}), [appliedDateRange, appliedTimeSlot, kioskRef]);

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('title'), href: '../overview' },
			{ title: translate('menu.revenue_report'), href: '../reports/revenue' },
			{ title: kioskRef, href: '#' },
		],
		[kioskRef, translate],
	);

	if (!kioskRef) {
		return (
			<PageContainer
				documentTitle={translate('reports.revenue.title')}
				breadcrumbs={breadcrumbs}
				isNotFound
			/>
		);
	}

	return (
		<PageContainer
			documentTitle={translate('reports.revenue_report.kiosk_revenue_detail.page_title', {
				name: kioskRef,
			})}
			breadcrumbs={breadcrumbs}
			actionBar={(
				<StickyFilterBar
					title={(
						<Stack gap='xs'>
							<Anchor
								component={Link}
								to='../reports/revenue?type=byKiosk'
								fz='sm'
								c='blue'
								underline='hover'
							>
								{translate('reports.revenue_report.kiosk_revenue_detail.back_to_revenue_report')}
							</Anchor>
							<Title fz='xl' fw={700} textWrap='nowrap'>
								{translate('reports.revenue_report.kiosk_revenue_detail.kiosk_heading', {
									name: 'kioskName',
								})}
							</Title>
						</Stack>
					)}
					filters={filters}
					handleApply={handleApply}
				/>
			)}
		>
			<KioskRevenueDetailBody filters={reportFilters} />
		</PageContainer>
	);
};


