
import { Space } from '@mantine/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { getOutermostVerticalScrollParent } from '../../common/helpers';
import { StickyFilterBar, type ControlPanelFilterConfig } from '../../components';
import { PageContainer } from '../../components/PageContainer';
import { useRevenueReportKioskOptions } from '../../features/reports/business';
import {
	InventoryReportContent,
	type InventoryReportAppliedFilters,
} from '../../features/reports/operations/components/InventoryReport';


export const InventoryReportPage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const reportSectionRef = useRef<HTMLDivElement>(null);
	const scrollAfterApplyRef = useRef(false);

	const [applied, setApplied] = useState<InventoryReportAppliedFilters>(() => ({
		kioskIds: null,
		kioskLabel: null,
	}));

	const [draftKioskIds, setDraftKioskIds] = useState<string[]>([]);
	const [draftKioskLabels, setDraftKioskLabels] = useState<string[]>([]);
	const [kioskSearch, setKioskSearch] = useState('');
	const kioskOptions = useRevenueReportKioskOptions(kioskSearch);

	useEffect(() => {
		if (!draftKioskIds.length) {
			setDraftKioskLabels([]);
			return;
		}
		const hits = kioskOptions.filter((o) => draftKioskIds.includes(o.value));
		setDraftKioskLabels(hits.map((h) => h.label));
	}, [draftKioskIds, kioskOptions]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'kiosk',
			type: 'searchableMultiSelect',
			value: draftKioskIds,
			onChange: setDraftKioskIds,
			searchValue: kioskSearch,
			onSearchChange: setKioskSearch,
			options: kioskOptions,
			placeholder: translate('reports.filter_bar.kiosk_placeholder'),
			clearable: true,
			minWidth: 240,
		},
	], [draftKioskIds, kioskSearch, kioskOptions, translate]);

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
			kioskIds: draftKioskIds,
			kioskLabel: draftKioskLabels.join(', '),
		});
	}, [draftKioskIds, draftKioskLabels]);

	return (
		<PageContainer documentTitle={translate('reports.inventory_report.title')}>
			<StickyFilterBar
				title={translate('reports.inventory_report.heading')}
				filters={filters}
				handleApply={handleApply}
			/>
			<Space h='md' />
			<div ref={reportSectionRef}>
				<InventoryReportContent applied={applied} />
			</div>
			<Space h='lg' />
		</PageContainer>
	);
};
