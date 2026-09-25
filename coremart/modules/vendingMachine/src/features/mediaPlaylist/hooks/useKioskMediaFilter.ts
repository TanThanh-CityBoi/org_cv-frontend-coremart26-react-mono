import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { controlPanelToSearchGraph, type ControlPanelFilterConfig } from '../../../components';
import { ArchivedStatus } from '../../../types';



/** Filter + graph cho API search kiosk media (`name` + `is_archived`). */
export function useKioskMediaFilter() {
	const { t: translate } = useTranslation('vending_machine');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);

	const resetSearch = useCallback(() => {
		setSearchValue('');
	}, []);

	const filters: ControlPanelFilterConfig[] = useMemo(
		() => {
			const defaultConfigs = [
				{
					key: 'search',
					searchFields: ['name'],
					type: 'search' as const,
					value: searchValue,
					onChange: setSearchValue,
					placeholder: translate('kiosk_media.search.placeholder'),
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
					placeholder: translate('kiosk_media.filter.status'),
					getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
				},
			];

			return defaultConfigs;
		},
		[searchValue, statusFilter, translate],
	);

	const graph = useMemo(
		() => controlPanelToSearchGraph(filters),
		[filters],
	);

	return { filters, graph, resetSearch };
}
