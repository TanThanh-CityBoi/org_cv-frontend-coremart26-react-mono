import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePaginationWithTotal } from '../../../common/hooks';
import {
	controlPanelToSearchGraph,
	type ControlPanelFilterConfig,
} from '../../../components';
import { ArchivedStatus, SearchGraph } from '../../../types';
import { kioskModelCrudService } from '../kioskModelService';
import { KioskModel } from '../types';


type SearchResponse = { items: KioskModel[], total: number };


export function useKioskModelList(graph?: SearchGraph) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(kioskModelCrudService.search);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatchMethod({ page: targetPage - 1, size, graph: searchGraph });
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const models = result.data?.items ?? [];
	const isLoading = !models.length && result.isPending;
	const isEmpty = !models.length && !result.isPending && result.doneAt != null;

	return {
		models,
		status: result.isPending ? 'pending' : 'success',
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}


export const useKioskModelFilter = () => {
	const { t: translate } = useTranslation('vending_machine');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([ArchivedStatus.ACTIVE]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			searchFields: ['referenceCode', 'name', 'description'],
			type: 'search' as const,
			value: searchValue,
			onChange: setSearchValue,
			placeholder: translate('kiosk_models.search.placeholder'),
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
			placeholder: translate('kiosk_models.filter.status'),
			getGraphValue: (value: ArchivedStatus[]) => value.map((value) => value === ArchivedStatus.ARCHIVED),
		},
	], [searchValue, statusFilter, translate]);

	const graph = useMemo(
		() => controlPanelToSearchGraph(filters),
		[filters],
	);

	return { filters, graph };
};
