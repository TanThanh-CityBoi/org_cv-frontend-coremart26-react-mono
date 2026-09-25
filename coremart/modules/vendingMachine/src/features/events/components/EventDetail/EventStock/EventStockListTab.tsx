import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { CreateEventStockModal } from './CreateEventStockModal';
import { DeleteEventStockModal } from './DeleteEventStockModal';
import { catalogById } from './eventStock.helpers';
import { EventStockEditModal } from './EventStockEditModal';
import { EventStockList } from './EventStockList';
import { getLocalizedName } from '../../../../../common/helpers';
import { usePaginationWithTotal } from '../../../../../common/hooks';
import { eventCrudService } from '../../../eventService';
import { eventStockCrudService } from '../../../eventStockService';
import {
	useCreateEventStock,
	useEventStockDelete,
	useEventStockUpdate,
} from '../../../hooks';
import { MOCK_EVENT_STOCK_CREATE_PRODUCTS } from '../../../mocks/mockEventStockCreateProducts';
import { useEventStockListTab } from '../hooks/useEventStockListTab';

import type { EventStock } from '../../../types';
import type { Event } from '../../../types';


// ─── fetch hook ──────────────────────────────────────────────────────────────

type StockSearchResponse = { items: EventStock[], total: number };

function useEventStockListPagedFetch(eventId: string | undefined, refreshTrigger?: number) {
	const { dispatchMethod, result } = useServiceLayer<StockSearchResponse>(eventStockCrudService.search);

	// Flat resource: the event is a filter, not a path segment.
	const fetchList = useCallback((targetPage: number, size: number) => {
		if (!eventId) return;
		dispatchMethod({ page: targetPage - 1, size, graph: { if: ['event_ref', 'eq', eventId] } });
	}, [dispatchMethod, eventId]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, {
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
		return dispatchMethod({ page: page - 1, size: pageSize, graph: { if: ['event_ref', 'eq', id] } });
	}, [dispatchMethod, eventId, page, pageSize]);

	return {
		stocks: result.data?.items ?? [],
		isLoading: result.isPending || result.doneAt == null,
		refetch,
		pagination,
	};
}

// ─── view model ──────────────────────────────────────────────────────────────

const CATALOG_MAP = catalogById(MOCK_EVENT_STOCK_CREATE_PRODUCTS);

function useEventStockListViewModel(event: Event) {
	const { i18n } = useTranslation('vending_machine');
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const { stocks, isLoading, refetch, pagination } = useEventStockListPagedFetch(event.id, refreshTrigger);
	const { dispatchMethod: reloadEvent } = useServiceLayer(eventCrudService.getById);

	const refreshDetail = useCallback(() => {
		refetch();
		if (event.id) reloadEvent({ id: event.id });
	}, [event.id, refetch, reloadEvent]);

	const handleCreateSuccess = useCallback(() => {
		setRefreshTrigger(prev => prev + 1);
		if (event.id) reloadEvent({ id: event.id });
	}, [event.id, reloadEvent]);

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
