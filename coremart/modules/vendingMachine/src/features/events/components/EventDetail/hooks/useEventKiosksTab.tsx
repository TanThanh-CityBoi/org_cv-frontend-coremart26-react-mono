import { TablePaginationProps } from '@nikkierp/ui/components';
import { IconPlus } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { useKioskListInEvent } from '@/features/events/hooks';
import { SearchGraph, SearchOperator } from '@/types';

import { useRegisterEventDetailTab } from '../eventDetailTabControl';

import type { Event } from '@/features/events/types';


type UseEventKiosksTabArgs = {
	event: Event;
	graph: SearchGraph;
};

function useTablePagination(
	listPagination: ReturnType<typeof useKioskListInEvent>['pagination'],
): TablePaginationProps {
	return useMemo(
		() => ({
			totalItems: listPagination.totalItems,
			page: listPagination.page,
			totalPages: listPagination.totalPages,
			pageSize: listPagination.pageSize,
			onPageChange: listPagination.onPageChange,
			onPageSizeChange: listPagination.onPageSizeChange,
		}),
		[listPagination],
	);
}

export function useEventKiosksTab({ event, graph }: UseEventKiosksTabArgs) {
	const { t: translate } = useTranslation();
	const list = useKioskListInEvent({ eventId: event.id, graph });
	const pagination = useTablePagination(list.pagination);

	const [assignModalOpened, setAssignModalOpened] = useState(false);

	const openAssignModal = useCallback(() => {
		setAssignModalOpened(true);
	}, [setAssignModalOpened]);

	const closeAssignModal = useCallback(() => {
		setAssignModalOpened(false);
	}, [setAssignModalOpened]);

	const tabActions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('coremart.vendingMachine.events.actions.addKiosks', {
				defaultValue: 'Thêm Kiosk',
			}),
			leftSection: <IconPlus size={16} />,
			onClick: openAssignModal,
			variant: 'filled' as const,
		},
	], [translate]);

	useRegisterEventDetailTab('kiosks', tabActions);

	return {
		kiosks: list.kiosks ?? [],
		isLoading: list.isLoading,
		refreshKiosks: list.handleRefresh,
		pagination,
		assignModalOpened,
		openAssignModal,
		closeAssignModal,
	};
}

export function useQueryKioskInEventGraph(eventId: string): SearchGraph {
	return useMemo(
		(): SearchGraph => ({
			if: ['events.id', SearchOperator.EQUAL, eventId],
		}),
		[eventId],
	);
}

export function useQueryKioskNotInEventGraph(eventId: string): SearchGraph {
	return useMemo(
		(): SearchGraph => ({
			or: [
				{if: ['events.id', SearchOperator.IS_NOT_SET]},
				{if: ['events', SearchOperator.NOT_LINKED, eventId]},
			],
		}),
		[eventId],
	);
}
