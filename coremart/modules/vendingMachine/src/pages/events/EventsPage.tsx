import { TablePaginationProps } from '@nikkierp/ui/components';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { asLegacyModelSchema } from '../../common/helpers';
import { ControlPanel } from '../../components';
import { ControlPanelViewModeProps } from '../../components/ControlPanel/ControlPanelViewMode';
import { PageContainer } from '../../components/PageContainer';
import {
	ArchiveEventModal,
	DeleteEventModal,
	EventCalendarView,
	EventDetailDrawer,
	EventGanttView,
	EventGridView,
	EventKanbanView,
	EventListPageProvider,
	EventTable,
	EventTableActions,
	eventSchema,
	useEventListPageActions,
	useEventListPageContext,
	useEventListPageConfig,
} from '../../features/events';

import type { Event } from '../../features/events/types';


export const EventsPage: React.FC = () => (
	<EventListPageProvider>
		<EventsPageContent />
	</EventListPageProvider>
);

export const EventsPageContent: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const { filter, list } = useEventListPageContext();
	const { breadcrumbs, actions, viewModeConfig } = useEventListPageConfig();
	const { delete: deleteEventHook, archive, preview } = useEventListPageActions();

	const navigate = useNavigate();

	const handleViewDetail = useCallback((evt: Event) => {
		navigate(`../events/${evt.id}`);
	}, [navigate]);

	const eventTableActions: EventTableActions = {
		preview: preview.handlePreview,
		archive: archive.handleOpenArchiveModal,
		restore: archive.handleOpenRestoreModal,
		delete: deleteEventHook.openDeleteModal,
		viewDetail: handleViewDetail,
	};

	const handleOpenDeleteModalById = (eventId: string) => {
		const ev = list.events?.find((row: Event) => row.id === eventId);
		if (ev) deleteEventHook.openDeleteModal(ev);
	};

	const navigateToEvent = useCallback((eventId: string) => {
		navigate(`../events/${eventId}`);
	}, [navigate]);

	const listPaginationProps: TablePaginationProps = {
		totalItems: list.pagination.totalItems,
		page: list.pagination.page,
		totalPages: list.pagination.totalPages,
		onPageChange: list.pagination.onPageChange,
		pageSize: list.pagination.pageSize,
		onPageSizeChange: list.pagination.onPageSizeChange,
	};

	return (
		<PageContainer
			isLoading={list.isLoading}
			isEmpty={list.isEmpty}
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					actions={actions}
					filters={filter.filters}
					viewMode={viewModeConfig as ControlPanelViewModeProps}
				/>,
			]}
			documentTitle={translate('menu.events')}
		>
			<EventViews
				events={(list.events ?? []) as Event[]}
				viewMode={viewModeConfig.value}
				isLoading={list.isLoading}
				listPaginationProps={listPaginationProps}
				tableActions={eventTableActions}
				onViewDetail={navigateToEvent}
				onDelete={handleOpenDeleteModalById}
			/>
			<DeleteEventModal
				opened={deleteEventHook.isOpenDeleteModal}
				onClose={deleteEventHook.closeDeleteModal}
				onConfirm={deleteEventHook.handleDelete}
				name={deleteEventHook.eventToDelete?.name ?? ''}
			/>
			<EventPreviewDrawer />
			<ArchiveEventModal
				opened={archive.isOpenArchiveModal}
				onClose={archive.handleCloseModal}
				onConfirm={archive.handleConfirmArchive}
				type={archive.pendingArchive?.targetArchived === false ? 'restore' : 'archive'}
				name={archive.pendingArchive?.event?.name ?? ''}
			/>
		</PageContainer>
	);
};

interface EventViewsProps {
	events: Event[];
	viewMode: 'list' | 'grid' | 'kanban' | 'gantt' | 'calendar';
	isLoading: boolean;
	listPaginationProps: TablePaginationProps;
	tableActions: EventTableActions;
	onViewDetail: (eventId: string) => void;
	onDelete: (eventId: string) => void;
}

const EventViews: React.FC<EventViewsProps> = ({
	events,
	viewMode,
	isLoading,
	listPaginationProps,
	tableActions,
	onViewDetail,
	onDelete,
}) => {
	const tableColumns = [
		'code', 'name', 'description', 'isArchived', 'runPhase', 'startTime', 'endTime', 'actions',
	];

	switch (viewMode) {
		case 'grid':
			return (
				<EventGridView
					events={events}
					isLoading={isLoading}
					actions={tableActions}
					pagination={listPaginationProps}
				/>
			);
		case 'kanban':
			return (
				<EventKanbanView
					events={events}
					isLoading={isLoading}
					actions={tableActions}
				/>
			);
		case 'gantt':
			return (
				<EventGanttView
					events={events}
					isLoading={isLoading}
					onViewDetail={onViewDetail}
					onDelete={onDelete}
				/>
			);
		case 'calendar':
			return (
				<EventCalendarView
					events={events}
					isLoading={isLoading}
					onViewDetail={onViewDetail}
					onDelete={onDelete}
				/>
			);
		case 'list':
		default:
			return (
				<EventTable
					columns={tableColumns}
					data={events as unknown as Record<string, unknown>[]}
					schema={asLegacyModelSchema(eventSchema)}
					isLoading={isLoading}
					actions={tableActions}
					pagination={listPaginationProps}
				/>
			);
	}
};

const EventPreviewDrawer: React.FC = () => {
	const { preview } = useEventListPageActions();
	return (
		<EventDetailDrawer
			opened={preview.isOpenPreview}
			onClose={preview.handleClosePreview}
			event={preview.selectedEvent}
			isLoading={preview.isLoadingPreview}
		/>
	);
};
