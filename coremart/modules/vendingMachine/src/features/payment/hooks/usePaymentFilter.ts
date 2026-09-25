import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { controlPanelToSearchGraph, type ControlPanelFilterConfig } from '../../../components';
import { ArchivedStatus } from '../../../types';


export function usePaymentFilter() {
	const { t: translate } = useTranslation('vending_machine');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);

	const filters: ControlPanelFilterConfig[] = useMemo(
		() => [
			{
				key: 'search',
				type: 'search',
				value: searchValue,
				onChange: setSearchValue,
				searchFields: ['name', 'method'],
				placeholder: translate('payment.search.placeholder'),
			},
			{
				key: 'isArchived',
				type: 'multiSelect' as const,
				value: statusFilter,
				onChange: setStatusFilter,
				options: [
					{ value: ArchivedStatus.ACTIVE, label: translate('status.active') },
					{ value: ArchivedStatus.ARCHIVED, label: translate('status.archived') },
				],
				placeholder: translate('payment.filter.status'),
				getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
			},
		],
		[statusFilter, searchValue, translate],
	);

	const graph = useMemo(
		() => controlPanelToSearchGraph(filters),
		[filters],
	);

	return { filters, graph };
}
