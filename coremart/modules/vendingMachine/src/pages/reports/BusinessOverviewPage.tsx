
import { Grid, Stack } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, i18nToLocalizedKey, LanguageCode } from '../../common/helpers';
import { PageContainer } from '../../components/PageContainer';
import { presetToRange, presetToGroupTime, type TimeRangePreset, type TimeRangePresetRange } from '../../components/RangePicker';
import {
	PaymentMethodStackedBarChart,
	RecentActivities,
	RevenueByHourChart,
	RevenueByRegion,
	RevenueTimeSeriesChart,
	RevenueGeneratedChart,
	WelcomeCard,
	useRevenueReportOverview,
	RevenueReportFilters,
	REVENUE_REPORT_TYPE,
	useRevenueTimeSeriesChart,
	useRevenueReportByHour,
	useRevenueReportByKiosk,
	RevenueByKioskBarChart,
	ProductRevenueTable,
	useRevenueReportByProduct,
	ProductCategoryRevenue,
	useRevenueReportByCategory,
	useRevenueReportByPaymentMethod,
} from '../../features/reports/business';


// Mock data - in a real app, this would come from API calls
const mockRevenueData = [
	{ date: '2026-01-23', lastYear: 12000, thisYear: 15000 },
	{ date: '2026-01-24', lastYear: 13500, thisYear: 16500 },
	{ date: '2026-01-25', lastYear: 14000, thisYear: 17000 },
	{ date: '2026-01-26', lastYear: 12500, thisYear: 16000 },
	{ date: '2026-01-27', lastYear: 15000, thisYear: 18000 },
	{ date: '2026-01-28', lastYear: 14500, thisYear: 17500 },
	{ date: '2026-01-29', lastYear: 16000, thisYear: 19000 },
	{ date: '2026-01-30', lastYear: 15500, thisYear: 18500 },
	{ date: '2026-01-31', lastYear: 17000, thisYear: 20000 },
	{ date: '2026-02-01', lastYear: 16500, thisYear: 19500 },
	{ date: '2026-02-02', lastYear: 18000, thisYear: 21000 },
	{ date: '2026-02-03', lastYear: 17500, thisYear: 20500 },
	{ date: '2026-02-04', lastYear: 19000, thisYear: 22000 },
	{ date: '2026-02-05', lastYear: 18500, thisYear: 21500 },
	{ date: '2026-02-06', lastYear: 20000, thisYear: 23000 },
];


const mockActivities = [
	{ id: '1', type: 'purchase' as const, description: 'New order received from customer', timeAgo: '2s ago' },
	{ id: '2', type: 'order' as const, description: 'Order #1234 has been shipped', timeAgo: '5m ago' },
	{ id: '3', type: 'question' as const, description: 'Customer inquiry about product availability', timeAgo: '12m ago' },
	{ id: '4', type: 'purchase' as const, description: 'Payment received for order #1235', timeAgo: '1 hr ago' },
	{ id: '5', type: 'event' as const, description: 'Scheduled maintenance completed', timeAgo: '2 hr ago' },
	{ id: '6', type: 'order' as const, description: 'Order #1236 processing', timeAgo: '3 hr ago' },
];


const mockRegionRevenue = [
	{ country: 'Japan', revenue: 44000, coordinates: [138.2529, 36.2048] },
	{ country: 'Greenland', revenue: 41000, coordinates: [-42.6043, 71.7069] },
	{ country: 'India', revenue: 38000, coordinates: [78.9629, 20.5937] },
	{ country: 'Egypt', revenue: 27000, coordinates: [30.8025, 26.8206] },
	{ country: 'Mexico', revenue: 19000, coordinates: [-102.5528, 23.6345] },
	{ country: 'Angola', revenue: 13000, coordinates: [17.8739, -11.2027] },
	{ country: 'Colombia', revenue: 11000, coordinates: [-74.2973, 4.5709] },
	{ country: 'Finland', revenue: 7000, coordinates: [25.7482, 61.9241] },
];


function formatLongDate(locale: LanguageCode = 'vi-VN'): string {
	const today = new Date();
	return today.toLocaleDateString(locale, {
		weekday: 'long',
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	});
}

function sectionOn(map: Record<string, boolean>, id: string): boolean {
	return map[id] !== false;
}


const GreetingSection = () => {
	const { t: translate, i18n } = useTranslation('vending_machine');
	const overviewfilters: RevenueReportFilters = useMemo(() => ({
		reportType: REVENUE_REPORT_TYPE.OVERVIEW,
		dateRange: [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()],
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}), [])	;
	const {data: overViewData} = useRevenueReportOverview(overviewfilters);

	const greeting = useMemo(() => {
		const hour = dayjs().hour();
		const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
		const timeOfDayLabel = translate(`common.time_of_day.${timeOfDay}`);
		return translate('reports.business.welcome_card.greeting', { timeOfDay: timeOfDayLabel });
	}, [i18n.language]);

	return (
		<WelcomeCard
			date={formatLongDate(i18nToLocalizedKey?.[i18n.language])}
			greeting={greeting}
			visitors={0}
			earnings={fmtCurrency(overViewData?.totalRevenue ?? 0)}
			orders={overViewData?.orderCount ?? 0}
			averageRevenue={fmtCurrency(overViewData?.averageRevenue ?? 0)}
			averageRevenuePerOrder={fmtCurrency(overViewData?.averageRevenuePerOrder ?? 0)}
			totalItemCount={overViewData?.totalItemCount ?? 0}
			totalSuccessItemCount={overViewData?.totalSuccessItemCount ?? 0}
			totalRefund={fmtCurrency(overViewData?.totalRefund ?? 0)}
			refundedOrderCount={overViewData?.refundedOrderCount ?? 0}
		/>
	);
};

const TIME_SERIES_DEFAULT_PRESET: TimeRangePreset = 'this_month';

const RevenueByTimeSeriesSection = () => {
	const { t: translate } = useTranslation('vending_machine');
	const [activePreset, setActivePreset] = useState<TimeRangePreset>(TIME_SERIES_DEFAULT_PRESET);
	const [dateRange, setDateRange] = useState<TimeRangePresetRange>(() => presetToRange(TIME_SERIES_DEFAULT_PRESET));

	const timeSeriesChartFilters: RevenueReportFilters = useMemo(() => ({
		reportType: REVENUE_REPORT_TYPE.OVERVIEW,
		dateRange,
		groupTime: presetToGroupTime(activePreset),
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}), [dateRange, activePreset]);

	const {
		overview: timeSeriesChartOverview,
		items: timeSeriesChartItems,
		pagination: chartPagination,
		isLoading: chartIsLoading,
		groupTime: timeSeriesChartGroupTime,
	} = useRevenueTimeSeriesChart(timeSeriesChartFilters);

	const handleFilterChange = useCallback((preset: TimeRangePreset, range: TimeRangePresetRange) => {
		setActivePreset(preset);
		setDateRange(range);
	}, []);

	return (
		<RevenueTimeSeriesChart
			showFilter
			activePreset={activePreset}
			defaultPreset={TIME_SERIES_DEFAULT_PRESET}
			onFilterChange={handleFilterChange}
			overview={timeSeriesChartOverview}
			items={timeSeriesChartItems}
			pagination={chartPagination}
			isLoading={chartIsLoading}
			groupTime={timeSeriesChartGroupTime}
			title={translate('reports.revenue_report.chart.revenue_overview')}
			subtitle={translate('reports.revenue_report.chart.revenue_overview_hint')}
		/>
	);
};

const HOUR_DEFAULT_PRESET: TimeRangePreset = 'this_month';

const RevenueByHourSection = () => {
	const [activePreset, setActivePreset] = useState<TimeRangePreset>(HOUR_DEFAULT_PRESET);
	const [dateRange, setDateRange] = useState<TimeRangePresetRange>(() => presetToRange(HOUR_DEFAULT_PRESET));

	const hourlyKioskChartFilters: RevenueReportFilters = useMemo(() => ({
		reportType: REVENUE_REPORT_TYPE.OVERVIEW,
		dateRange,
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}), [dateRange]);

	const { items: hourlyKioskChartItems } = useRevenueReportByHour(hourlyKioskChartFilters);

	const handleFilterChange = useCallback((preset: TimeRangePreset, range: TimeRangePresetRange) => {
		setActivePreset(preset);
		setDateRange(range);
	}, []);

	return (
		<RevenueByHourChart
			showFilter
			activePreset={activePreset}
			defaultPreset={HOUR_DEFAULT_PRESET}
			onFilterChange={handleFilterChange}
			data={hourlyKioskChartItems ?? []}
		/>
	);
};

const KIOSK_DEFAULT_PRESET: TimeRangePreset = 'this_month';

const RevenueByKioskSection = () => {
	const { t: translate } = useTranslation('vending_machine');
	const [activePreset, setActivePreset] = useState<TimeRangePreset>(KIOSK_DEFAULT_PRESET);
	const [dateRange, setDateRange] = useState<TimeRangePresetRange>(() => presetToRange(KIOSK_DEFAULT_PRESET));

	const kioskRevenueChartFilters: RevenueReportFilters = useMemo(() => ({
		reportType: REVENUE_REPORT_TYPE.OVERVIEW,
		dateRange,
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}), [dateRange]);

	const { items: kioskRevenueChartItems } = useRevenueReportByKiosk(kioskRevenueChartFilters);

	const handleFilterChange = useCallback((preset: TimeRangePreset, range: TimeRangePresetRange) => {
		setActivePreset(preset);
		setDateRange(range);
	}, []);

	return (
		<RevenueByKioskBarChart
			showFilter
			activePreset={activePreset}
			defaultPreset={KIOSK_DEFAULT_PRESET}
			onFilterChange={handleFilterChange}
			data={kioskRevenueChartItems ?? []}
			title={translate('reports.revenue_by_kiosk.top_kiosks')}
			description={translate('reports.revenue_by_kiosk.top_kiosks_description')}
		/>
	);
};

const PRODUCT_TABLE_DEFAULT_PRESET: TimeRangePreset = 'this_month';

const ProductRevenueTableSection = () => {
	const { t: translate } = useTranslation('vending_machine');
	const [activePreset, setActivePreset] = useState<TimeRangePreset>(PRODUCT_TABLE_DEFAULT_PRESET);
	const [dateRange, setDateRange] = useState<TimeRangePresetRange>(() => presetToRange(PRODUCT_TABLE_DEFAULT_PRESET));

	const topProductsTableFilters: RevenueReportFilters = useMemo(() => ({
		reportType: REVENUE_REPORT_TYPE.OVERVIEW,
		dateRange,
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}), [dateRange]);

	const {
		items: topProductsTableItems,
		pagination: topProductsTablePagination,
		isLoading: topProductsTableIsLoading,
		error: topProductsTableError,
	} = useRevenueReportByProduct(topProductsTableFilters);

	const handleFilterChange = useCallback((preset: TimeRangePreset, range: TimeRangePresetRange) => {
		setActivePreset(preset);
		setDateRange(range);
	}, []);

	return (
		<ProductRevenueTable
			showFilter
			activePreset={activePreset}
			defaultPreset={PRODUCT_TABLE_DEFAULT_PRESET}
			onFilterChange={handleFilterChange}
			title={translate('reports.revenue_by_product.top_products_table_title')}
			description={translate('reports.revenue_by_product.top_products_table_description')}
			items={topProductsTableItems}
			pagination={topProductsTablePagination}
			isLoading={topProductsTableIsLoading}
			error={topProductsTableError}
		/>
	);
};

const CATEGORY_DEFAULT_PRESET: TimeRangePreset = 'this_month';

const ProductCategoryRevenueSection = () => {
	const [activePreset, setActivePreset] = useState<TimeRangePreset>(CATEGORY_DEFAULT_PRESET);
	const [dateRange, setDateRange] = useState<TimeRangePresetRange>(() => presetToRange(CATEGORY_DEFAULT_PRESET));

	const filters: RevenueReportFilters = useMemo(() => ({
		reportType: REVENUE_REPORT_TYPE.OVERVIEW,
		dateRange,
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}), [dateRange]);

	const { items, pagination, isLoading } = useRevenueReportByCategory(filters);

	const handleFilterChange = useCallback((preset: TimeRangePreset, range: TimeRangePresetRange) => {
		setActivePreset(preset);
		setDateRange(range);
	}, []);

	return (
		<ProductCategoryRevenue
			showFilter
			items={items}
			pagination={pagination}
			isLoading={isLoading}
			activePreset={activePreset}
			defaultPreset={CATEGORY_DEFAULT_PRESET}
			onFilterChange={handleFilterChange}
		/>
	);
};

const PAYMENT_DEFAULT_PRESET: TimeRangePreset = 'this_month';

const PaymentMethodRevenueSection = () => {
	const [activePreset, setActivePreset] = useState<TimeRangePreset>(PAYMENT_DEFAULT_PRESET);
	const [dateRange, setDateRange] = useState<TimeRangePresetRange>(() => presetToRange(PAYMENT_DEFAULT_PRESET));

	const filters: RevenueReportFilters = useMemo(() => ({
		reportType: REVENUE_REPORT_TYPE.OVERVIEW,
		dateRange,
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}), [dateRange]);

	const { data: overviewData } = useRevenueReportOverview(filters);
	const { items, pagination, isLoading } = useRevenueReportByPaymentMethod(filters);

	const handleFilterChange = useCallback((preset: TimeRangePreset, range: TimeRangePresetRange) => {
		setActivePreset(preset);
		setDateRange(range);
	}, []);

	return (
		<PaymentMethodStackedBarChart
			showFilter
			activePreset={activePreset}
			defaultPreset={PAYMENT_DEFAULT_PRESET}
			onFilterChange={handleFilterChange}
			items={items ?? []}
			isLoading={isLoading}
			pagination={pagination}
			totalRevenue={Number(overviewData?.totalRevenue ?? 0)}
		/>
	);
};

export function BusinessOverviewPage(): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');
	const [sectionVisibility, _setSectionVisibility] = useState<Record<string, boolean>>({
		summaryCards: true,
		hourlyKiosk: true,
		trendsCategory: true,
		productsPayment: true,
		regionMap: true,
	});

	return (
		<PageContainer documentTitle={translate('reports.revenue.title')}>
			<Stack gap='md'>
				{sectionOn(sectionVisibility, 'summaryCards') && (
					<Grid>
						<Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
							<GreetingSection />
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 12, lg: 8 }}>
							<RevenueByTimeSeriesSection />
						</Grid.Col>
					</Grid>
				)}
				{sectionOn(sectionVisibility, 'hourlyKiosk') && (
					<Grid>
						<Grid.Col span={{ base: 12, lg: 7 }}>
							<RevenueByHourSection />
						</Grid.Col>
						<Grid.Col span={{ base: 12, lg: 5 }}>
							<RevenueByKioskSection />
						</Grid.Col>
					</Grid>
				)}
				{sectionOn(sectionVisibility, 'trendsCategory') && (
					<Grid>
						<Grid.Col span={{ base: 12, lg: 7 }}>
							<ProductRevenueTableSection />
						</Grid.Col>
						<Grid.Col span={{ base: 12, lg: 5 }}>
							<Stack gap='md' h='100%'>
								<ProductCategoryRevenueSection />
								<PaymentMethodRevenueSection />
							</Stack>
						</Grid.Col>
					</Grid>
				)}

				{sectionOn(sectionVisibility, 'productsPayment') && (
					<Grid>
						<Grid.Col span={{ base: 12, lg: 7 }}>
							<RevenueGeneratedChart data={mockRevenueData} />
						</Grid.Col>
						<Grid.Col span={{ base: 12, lg: 5 }}>
							<RecentActivities activities={mockActivities} />
						</Grid.Col>
					</Grid>
				)}

				{sectionOn(sectionVisibility, 'regionMap') && (
					<Grid>
						<Grid.Col span={12}>
							<RevenueByRegion data={mockRegionRevenue as any} />
						</Grid.Col>
					</Grid>
				)}
			</Stack>
		</PageContainer>
	);
}
