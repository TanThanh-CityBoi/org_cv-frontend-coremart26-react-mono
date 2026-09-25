/* eslint-disable max-lines-per-function */
import { Space } from '@mantine/core';
import { DateValue, DatesRangeValue } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { type VendingMachineDispatch, revenueReportActions } from '@/appState';
import { getOutermostVerticalScrollParent } from '@/common/helpers';
import { StickyFilterBar, type ControlPanelFilterConfig } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import { useRevenueReportKioskOptions } from '@/features/reports/business';
import { RevenueReportSwitcher } from '@/features/reports/business/components';
import {
	parseRevenueReportTypeFromUrl,
	REVENUE_REPORT_TYPE,
	type RevenueReportFilters,
	type RevenueReportTypeKey,
} from '@/features/reports/business/components/RevenueReportSwitcher';


export const RevenueReportPage: React.FC = () => {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const { t: translate } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	const reportSectionRef = useRef<HTMLDivElement>(null);
	const scrollAfterApplyRef = useRef(false);

	const defaultRange = React.useMemo((): DatesRangeValue<DateValue> => [
		dayjs().startOf('month').toDate(),
		dayjs().endOf('day').toDate(),
	], []);

	const {rawParam, urlReportType} = useMemo(
		() => parseRevenueReportTypeFromUrl(searchParams.get('type')),
		[searchParams],
	);

	useEffect(() => {
		if(rawParam === urlReportType) return;
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set('type', urlReportType);
			return next;
		}, { replace: true });
	}, [rawParam, setSearchParams]);

	const [filters, setFilters] = useState<RevenueReportFilters>(() => ({
		reportType: urlReportType,
		dateRange: [
			dayjs().startOf('month').toDate(),
			dayjs().endOf('day').toDate(),
		],
		kioskIds: [],
		timeSlot: { from: null, to: null },
	}));

	const [draftReportType, setDraftReportType] = useState<RevenueReportTypeKey>(urlReportType);
	const [draftDateRange, setDraftDateRange] = useState<DatesRangeValue<DateValue> | undefined>(defaultRange);
	const [draftKioskIds, setDraftKioskIds] = useState<string[]>([]);
	const [draftTimeSlot, setDraftTimeSlot] = useState<{ from: string | null; to: string | null }>({
		from: null,
		to: null,
	});

	const [kioskSearch, setKioskSearch] = useState('');
	const kioskOptions = useRevenueReportKioskOptions(kioskSearch);

	const filterConfigs: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'reportType',
			type: 'select',
			value: [draftReportType],
			onChange: (vals: string[]) => {
				const next = vals[0] as RevenueReportTypeKey | undefined;
				setDraftReportType(next ?? REVENUE_REPORT_TYPE.OVERVIEW);
			},
			options: [
				{ value: REVENUE_REPORT_TYPE.OVERVIEW, label: translate('coremart.vendingMachine.reports.revenueReport.typeOverview') },
				{ value: REVENUE_REPORT_TYPE.BY_KIOSK, label: translate('coremart.vendingMachine.reports.revenueReport.typeByKiosk') },
				{ value: REVENUE_REPORT_TYPE.BY_PAYMENT, label: translate('coremart.vendingMachine.reports.revenueReport.typeByPayment') },
				{ value: REVENUE_REPORT_TYPE.BY_PRODUCT, label: translate('coremart.vendingMachine.reports.revenueReport.typeByProduct') },
			],
			placeholder: translate('coremart.vendingMachine.reports.revenueReport.reportType'),
			clearable: false,
			includeInActiveSummary: false,
			clearWithClearAll: false,
			minWidth: 220,
		},
		{
			key: 'kiosk',
			type: 'searchableMultiSelect',
			value: draftKioskIds,
			onChange: setDraftKioskIds,
			searchValue: kioskSearch,
			onSearchChange: setKioskSearch,
			options: kioskOptions,
			placeholder: translate('coremart.vendingMachine.reports.filterBar.kioskPlaceholder'),
			clearable: true,
			minWidth: 280,
		},
		{
			key: 'period',
			type: 'dateRange',
			value: draftDateRange,
			onChange: setDraftDateRange,
			placeholder: translate('coremart.vendingMachine.common.datePicker.selectDateRange'),
			clearable: true,
		},
		{
			key: 'timeSlot',
			type: 'timeSlot',
			value: draftTimeSlot,
			onChange: setDraftTimeSlot,
			clearable: true,
		},
	], [
		draftReportType,
		draftKioskIds,
		kioskSearch,
		kioskOptions,
		draftDateRange,
		draftTimeSlot,
		translate,
	]);

	useEffect(() => {
		setFilters((prev) => (prev.reportType === urlReportType ? prev : { ...prev, reportType: urlReportType }));
		setDraftReportType((d) => (d === urlReportType ? d : urlReportType));
	}, [urlReportType]);

	useEffect(() => {
		if (!scrollAfterApplyRef.current) {
			return;
		}
		scrollAfterApplyRef.current = false;
		const scrollRoot = getOutermostVerticalScrollParent(reportSectionRef.current);
		if (scrollRoot) {
			scrollRoot.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
			return;
		}
		window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
	}, [filters]);

	const handleApply = React.useCallback(() => {
		scrollAfterApplyRef.current = true;
		const kioskIds = [...new Set(draftKioskIds.filter(Boolean))];
		dispatch(revenueReportActions.setReportKioskIds(kioskIds));

		if(!draftDateRange || !draftDateRange[0] || !draftDateRange[1]) {
			notifications.show({
				title: translate('coremart.vendingMachine.common.datePicker.selectDateRange'),
				message: translate('coremart.vendingMachine.common.datePicker.selectDateRangeHint'),
				color: 'yellow',
				icon: <IconAlertCircle size={16} />,
				loading: false,
			});
			return;
		}

		setFilters({
			reportType: draftReportType,
			dateRange: draftDateRange,
			kioskIds,
			timeSlot: draftTimeSlot,
		});
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set('type', draftReportType);
			return next;
		}, { replace: true });
	}, [dispatch, draftReportType, draftDateRange, draftKioskIds, draftTimeSlot, setSearchParams]);

	return (
		<PageContainer documentTitle={translate('coremart.vendingMachine.reports.revenue.title')}>
			<StickyFilterBar
				title={translate('coremart.vendingMachine.menu.revenue_report')}
				filters={filterConfigs} handleApply={handleApply}
			/>
			<Space h='md' />
			<div ref={reportSectionRef}>
				<RevenueReportSwitcher active={filters.reportType ?? REVENUE_REPORT_TYPE.OVERVIEW} filters={filters} />
			</div>
			<Space h='lg' />
		</PageContainer>
	);
};
