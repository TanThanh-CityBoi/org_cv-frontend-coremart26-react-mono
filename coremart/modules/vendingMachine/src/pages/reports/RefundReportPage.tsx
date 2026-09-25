/* eslint-disable max-lines-per-function */
import { Space, Stack } from '@mantine/core';
import { DateValue, DatesRangeValue } from '@mantine/dates';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { getOutermostVerticalScrollParent } from '../../common/helpers';
import { StickyFilterBar, type ControlPanelFilterConfig } from '../../components';
import { PageContainer } from '../../components/PageContainer';
import {
	RefundReportInsights,
	RefundReportTable,
	type RefundReportAppliedFilters,
} from '../../features/reports/business/components/RefundReport';
import { useRevenueReportKioskOptions } from '../../features/reports/business/hooks/useRevenueReportKioskOptions';


export const RefundReportPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const reportSectionRef = useRef<HTMLDivElement>(null);
	const scrollAfterApplyRef = useRef(false);

	const defaultRange = useMemo((): DatesRangeValue<DateValue> => [
		dayjs().startOf('month').toDate(),
		dayjs().endOf('day').toDate(),
	], []);

	const [applied, setApplied] = useState<RefundReportAppliedFilters>(() => ({
		dateRange: defaultRange,
		kioskId: null,
		kioskLabel: null,
		timeSlot: { from: null, to: null },
	}));

	const [draftDateRange, setDraftDateRange] = useState<DatesRangeValue<DateValue> | undefined>(defaultRange);
	const [draftKioskId, setDraftKioskId] = useState<string | null>(null);
	const [draftKioskLabel, setDraftKioskLabel] = useState<string | null>(null);
	const [draftTimeSlot, setDraftTimeSlot] = useState<{ from: string | null, to: string | null }>({
		from: null,
		to: null,
	});

	const [kioskSearch, setKioskSearch] = useState('');
	const kioskOptions = useRevenueReportKioskOptions(kioskSearch);

	useEffect(() => {
		if (!draftKioskId) {
			setDraftKioskLabel(null);
			return;
		}
		const hit = kioskOptions.find((o) => o.value === draftKioskId);
		setDraftKioskLabel((prev) => hit?.label ?? prev);
	}, [draftKioskId, kioskOptions]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'kiosk',
			type: 'searchableSelect',
			value: draftKioskId,
			onChange: setDraftKioskId,
			searchValue: kioskSearch,
			onSearchChange: setKioskSearch,
			options: kioskOptions,
			placeholder: translate('reports.filter_bar.kiosk_placeholder'),
			clearable: true,
			minWidth: 240,
		},
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
	], [draftKioskId, kioskSearch, kioskOptions, draftDateRange, draftTimeSlot, translate]);

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
	}, [applied]);

	const handleApply = useCallback(() => {
		scrollAfterApplyRef.current = true;
		setApplied({
			dateRange: draftDateRange,
			kioskId: draftKioskId,
			kioskLabel: draftKioskId ? draftKioskLabel : null,
			timeSlot: draftTimeSlot,
		});
	}, [draftDateRange, draftKioskId, draftKioskLabel, draftTimeSlot]);

	return (
		<PageContainer documentTitle={translate('reports.refund_report.title')}>
			<StickyFilterBar
				title={translate('reports.refund_report.heading')}
				filters={filters}
				handleApply={handleApply}
			/>
			<Space h='md' />
			<div ref={reportSectionRef}>
				<Stack gap='lg'>
					<RefundReportInsights applied={applied} />
					<RefundReportTable applied={applied} />
				</Stack>
			</div>
			<Space h='lg' />
		</PageContainer>
	);
};
