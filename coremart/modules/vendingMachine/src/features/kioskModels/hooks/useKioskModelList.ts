
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';


import {
	VendingMachineDispatch,
	kioskModelActions,
	selectKioskModelList,
} from '@/appState';
import { usePagination } from '@/common/hooks';
import {
	controlPanelToSearchGraph,
	type ControlPanelFilterConfig,
} from '@/components';
import { ArchivedStatus, SearchGraph, SearchParams } from '@/types';

import { KioskModel } from '../types';


export function useKioskModelList(graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectKioskModelList);

	const fetchList = React.useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		const params: SearchParams<KioskModel> = {
			page: targetPage - 1,
			size,
			graph: searchGraph,
		};
		dispatch(kioskModelActions.listKioskModels(params));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectKioskModelList, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = React.useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const models = list.items ?? [];
	const status = list.status;
	const isLoading = !models?.length && (status === 'pending' || status === 'idle');
	const isEmpty = !models?.length && status !== 'idle' && status !== 'pending';

	return {
		models,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}


export const useKioskModelFilter = () => {
	const { t: translate } = useTranslation();
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<string[]>([ArchivedStatus.ACTIVE]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			searchFields: ['referenceCode', 'name', 'description'],
			type: 'search' as const,
			value: searchValue,
			onChange: setSearchValue,
			placeholder: translate('coremart.vendingMachine.kioskModels.search.placeholder'),
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
			placeholder: translate('coremart.vendingMachine.kioskModels.filter.status'),
			getGraphValue: (value: ArchivedStatus[]) => value.map((value) => value === ArchivedStatus.ARCHIVED),
		},
	], [searchValue, statusFilter, translate]);

	const graph = useMemo(
		() => controlPanelToSearchGraph(filters),
		[filters],
	);

	return { filters, graph };
};
