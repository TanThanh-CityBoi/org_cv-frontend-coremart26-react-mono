import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch, eventActions, selectEventStocks } from '@/appState';
import { getLocalizedName } from '@/common/helpers';
import { usePagination } from '@/common/hooks';
import { useEventStockListTab } from '@/features/events/components/EventDetail/hooks/useEventStockListTab';
import {
	useCreateEventStock,
	useEventStockDelete,
	useEventStockUpdate,
} from '@/features/events/hooks';
import { MOCK_EVENT_STOCK_CREATE_PRODUCTS } from '@/features/events/mocks/mockEventStockCreateProducts';

import { CreateEventStockModal } from './CreateEventStockModal';
import { DeleteEventStockModal } from './DeleteEventStockModal';
import { catalogById } from './eventStock.helpers';
import { EventStockEditModal } from './EventStockEditModal';
import { EventStockList } from './EventStockList';

import type { Event } from '@/features/events/types';


// ─── fetch hook ──────────────────────────────────────────────────────────────

function useEventStockListPagedFetch(eventId: string | undefined, refreshTrigger?: number) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const eventStocksState = useMicroAppSelector(selectEventStocks);

	const fetchList = useCallback((targetPage: number, size: number) => {
		if (!eventId) return;
		dispatch(eventActions.fetchEventStocks({ eventId, page: targetPage - 1, size }));
	}, [dispatch, eventId]);

	const pagination = usePagination(fetchList, selectEventStocks, {
		resetPageKey: eventId,
		fallbackPageSize: 10,
	});
	const { page, pageSize } = pagination;

	useEffect(() => {
		if (eventId) fetchList(page, pageSize);
	}, [fetchList, page, pageSize, eventId, refreshTrigger]); // refreshTrigger forces re-fetch

	const refetch = useCallback((overrideEventId?: string) => {
		const id = overrideEventId ?? eventId;
		if (!id) return Promise.reject(new Error('Missing event id'));
		return dispatch(eventActions.fetchEventStocks({ eventId: id, page: page - 1, size: pageSize }));
	}, [dispatch, eventId, page, pageSize]);

	return {
		stocks: eventStocksState.items ?? [],
		isLoading: eventStocksState.status === 'pending' || eventStocksState.status === 'idle',
		refetch,
		pagination,
	};
}

// ─── view model ──────────────────────────────────────────────────────────────

const CATALOG_MAP = catalogById(MOCK_EVENT_STOCK_CREATE_PRODUCTS);

function useEventStockListViewModel(event: Event) {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const { i18n } = useTranslation();
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const { stocks, isLoading, refetch, pagination } = useEventStockListPagedFetch(event.id, refreshTrigger);

	const refreshDetail = useCallback(() => {
		refetch();
		if (event.id) dispatch(eventActions.getEvent(event.id));
	}, [dispatch, event.id, refetch]);

	const handleCreateSuccess = useCallback(() => {
		setRefreshTrigger(prev => prev + 1);
		if (event.id) dispatch(eventActions.getEvent(event.id));
	}, [dispatch, event.id]);

	const {
		isOpenCreateModal,
		handleOpenCreateModal,
		handleCloseModal: handleCloseCreateModal,
		handleSubmit: handleCreateSubmit,
		isSubmitting: isCreateSubmitting,
	} = useCreateEventStock({ event, onSuccess: handleCreateSuccess });

	const {
		editStock,
		isEditModalOpen,
		openEditModal,
		closeEditModal,
		handleSubmit: handleEditSubmit,
		isSubmitting: isEditSubmitting,
	} = useEventStockUpdate({ event, onSuccess: refreshDetail });

	const {
		deleteStock,
		isDeleteModalOpen,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
	} = useEventStockDelete({ onSuccess: refreshDetail });

	const cat = deleteStock ? CATALOG_MAP.get(deleteStock.productRef) : undefined;
	const deleteName = cat ? getLocalizedName(cat.name, i18n.language) || '—' : '—';
	const deleteSku = cat?.sku ?? deleteStock?.productRef ?? '—';

	return {
		stocks,
		isLoading,
		pagination,
		lang: i18n.language,
		isOpenCreateModal,
		handleOpenCreateModal,
		handleCloseCreateModal,
		handleCreateSubmit,
		isCreateSubmitting,
		editStock,
		isEditModalOpen,
		openEditModal,
		closeEditModal,
		handleEditSubmit,
		isEditSubmitting,
		isDeleteModalOpen,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
		deleteName,
		deleteSku,
	};
}

// ─── component ───────────────────────────────────────────────────────────────

interface EventStockListTabProps {
	event: Event;
}

export const EventStockListTab: React.FC<EventStockListTabProps> = ({ event }) => {
	const vm = useEventStockListViewModel(event);

	useEventStockListTab({ handleAddStock: vm.handleOpenCreateModal });

	return (
		<>
			<CreateEventStockModal
				event={event}
				opened={vm.isOpenCreateModal}
				onClose={vm.handleCloseCreateModal}
				onSubmit={vm.handleCreateSubmit}
				isSubmitting={vm.isCreateSubmitting}
			/>
			<EventStockEditModal
				opened={vm.isEditModalOpen}
				stock={vm.editStock}
				lang={vm.lang}
				onClose={vm.closeEditModal}
				onSubmit={vm.handleEditSubmit}
				isSubmitting={vm.isEditSubmitting}
			/>
			<DeleteEventStockModal
				opened={vm.isDeleteModalOpen}
				onClose={vm.closeDeleteModal}
				onConfirm={vm.confirmDelete}
				productName={vm.deleteName}
				sku={vm.deleteSku}
			/>
			<EventStockList
				stocks={vm.stocks}
				isLoading={vm.isLoading}
				pagination={vm.pagination}
				onEdit={vm.openEditModal}
				onDelete={vm.openDeleteModal}
			/>
		</>
	);
};
