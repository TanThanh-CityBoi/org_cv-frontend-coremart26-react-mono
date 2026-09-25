import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { controlPanelToSearchGraph, type ControlPanelFilterConfig } from '@/components';
import { ArchivedStatus } from '@/types';


export function useSettingFilter() {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			searchFields: ['code', 'name'],
			type: 'search' as const,
			value: searchValue,
			onChange: setSearchValue,
			placeholder: translate('coremart.vendingMachine.settings.search.placeholder'),
		},
		{
			key: 'isArchived',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: ArchivedStatus.ACTIVE, label: translate('nikki.general.status.active') },
				{ value: ArchivedStatus.ARCHIVED, label: translate('nikki.general.status.archived') },
			],
			placeholder: translate('coremart.vendingMachine.settings.filter.status'),
			getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
		},
	], [searchValue, statusFilter, translate]);

	const graph = useMemo(
		() => controlPanelToSearchGraph(filters),
		[filters],
	);

	return { filters, graph };
}
