/* eslint-disable max-lines-per-function */
import { Divider, Stack } from '@mantine/core';
import { DateValue, DatesRangeValue } from '@mantine/dates';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { getOutermostVerticalScrollParent } from '../../common/helpers';
import { StickyFilterBar, type ControlPanelFilterConfig } from '../../components';
import { PageContainer } from '../../components/PageContainer';
import {
	PnlManualWorksheet,
	PnlReportDashboard,
} from '../../features/reports/business/components/PnlReport';
import { useRevenueReportKioskOptions } from '../../features/reports/business/hooks/useRevenueReportKioskOptions';


export const PnlReportPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const reportSectionRef = useRef<HTMLDivElement>(null);
	const scrollAfterApplyRef = useRef(false);

	const defaultRange = useMemo((): DatesRangeValue<DateValue> => [
		dayjs().startOf('month').toDate(),
		dayjs().endOf('day').toDate(),
	], []);

	const [appliedRange, setAppliedRange] = useState<DatesRangeValue<DateValue> | undefined>(defaultRange);
	const [appliedKioskId, setAppliedKioskId] = useState<string | null>(null);
	const [applyNonce, setApplyNonce] = useState(0);

	const [draftDateRange, setDraftDateRange] = useState<DatesRangeValue<DateValue> | undefined>(defaultRange);
	const [draftKioskId, setDraftKioskId] = useState<string | null>(null);
	const [draftTimeSlot, setDraftTimeSlot] = useState<{ from: string | null, to: string | null }>({
		from: null,
		to: null,
	});

	const [kioskSearch, setKioskSearch] = useState('');
	const kioskOptions = useRevenueReportKioskOptions(kioskSearch);

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
			scrollRoot.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
	}, [appliedRange, appliedKioskId]);

	const handleApply = useCallback(() => {
		scrollAfterApplyRef.current = true;
		setAppliedRange(draftDateRange);
		setAppliedKioskId(draftKioskId);
		setApplyNonce((n) => n + 1);
	}, [draftDateRange, draftKioskId]);

	return (
		<PageContainer
			documentTitle={translate('reports.pnl_report.document_title')}
			actionBar={
				<StickyFilterBar
					title={translate('menu.pnl_report')}
					filters={filters}
					handleApply={handleApply}
				/>
			}
		>
			<div ref={reportSectionRef}>
				<Stack gap='lg'>
					<PnlReportDashboard />
					<Divider my='md' />
					<PnlManualWorksheet applyNonce={applyNonce} />
				</Stack>
			</div>
		</PageContainer>
	);
};
