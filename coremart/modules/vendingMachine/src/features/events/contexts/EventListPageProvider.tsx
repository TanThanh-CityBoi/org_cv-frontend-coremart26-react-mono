import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { BreadcrumbItem } from '../../../components/BreadCrumbs';
import { ControlPanelActionItem } from '../../../components/ControlPanel';
import {
	useEventArchive,
	useEventDelete,
	useEventFilter,
	useEventList,
	useEventPreview,
} from '../hooks';


export type EventListViewMode = 'list' | 'grid' | 'kanban' | 'gantt' | 'calendar';

type EventListPageContextValue = {
	filter: ReturnType<typeof useEventFilter>,
	list: ReturnType<typeof useEventList>,
	deleteEvent: ReturnType<typeof useEventDelete>,
	archiveEvent: ReturnType<typeof useEventArchive>,
	previewEvent: ReturnType<typeof useEventPreview>,
};

const EventListPageContext = createContext<EventListPageContextValue | null>(null);

export type EventListPageProviderProps = React.PropsWithChildren & {
	//
};

export function EventListPageProvider(props: EventListPageProviderProps) {
	const filter = useEventFilter();
	const list = useEventList({ graph: filter.graph });
	const deleteEvent = useEventDelete({ onSuccess: list.handleRefresh });
	const archiveEvent = useEventArchive({ onSuccess: list.handleRefresh });
	const previewEvent = useEventPreview();

	const contextValue: EventListPageContextValue = useMemo(
		() => ({ filter, list, deleteEvent, archiveEvent, previewEvent }),
		[filter, list, deleteEvent, archiveEvent, previewEvent],
	);

	return (
		<EventListPageContext.Provider value={contextValue}>
			{props.children}
		</EventListPageContext.Provider>
	);
}

export function useEventListPageContext() {
	const ctx = useContext(EventListPageContext);
	if (!ctx) throw new Error('useEventListPageContext must be used within EventListPageProvider');
	return ctx;
}

export interface UseEventListPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelActionItem[];
	viewModeConfig: {
		value: EventListViewMode,
		onChange: (mode: EventListViewMode) => void,
		segments: EventListViewMode[],
	};
}

export function useEventListPageConfig(): UseEventListPageConfigReturn {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');
	const [viewMode, setViewMode] = useState<EventListViewMode>('list');

	const { list } = useEventListPageContext();
	const { handleRefresh } = list;

	const handleCreate = () => navigate('../events/create');

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('menu.events'), href: '#' },
	], [translate]);

	const actions = useMemo(() => [
		{
			label: translate('action.create'),
			leftSection: <IconPlus size={16} />,
			onClick: handleCreate,
		},
		{
			label: translate('action.refresh'),
			leftSection: <IconRefresh size={16} />,
			onClick: handleRefresh,
			variant: 'outline' as const,
		},
	], [handleRefresh, translate]);

	const viewModeConfig: UseEventListPageConfigReturn['viewModeConfig'] = useMemo(() => ({
		value: viewMode,
		onChange: (mode) => setViewMode(mode),
		segments: ['list', 'grid', 'kanban', 'gantt', 'calendar'],
	}), [viewMode]);

	return { breadcrumbs, actions, viewModeConfig };
}

export function useEventListPageActions() {
	const ctx = useContext(EventListPageContext);
	if (!ctx) throw new Error('useEventListPageActions must be used within EventListPageProvider');
	return {
		delete: ctx.deleteEvent,
		archive: ctx.archiveEvent,
		preview: ctx.previewEvent,
	};
}
