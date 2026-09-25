import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { BreadcrumbItem } from '../../../components/BreadCrumbs';
import { ControlPanelActionItem } from '../../../components/ControlPanel';
import { useSettingArchive, useSettingDelete, useSettingFilter, useSettingList, useSettingPreview } from '../hooks';
import { SettingListViewMode } from '../types';


type SettingListPageContextValue = {
	filter: ReturnType<typeof useSettingFilter>,
	list: ReturnType<typeof useSettingList>,
	deleteSetting: ReturnType<typeof useSettingDelete>,
	archiveSetting: ReturnType<typeof useSettingArchive>,
	previewSetting: ReturnType<typeof useSettingPreview>,
};

const SettingListPageContext = createContext<SettingListPageContextValue | null>(null);

export type SettingListPageProviderProps = React.PropsWithChildren;

export function SettingListPageProvider(props: SettingListPageProviderProps) {
	const filter = useSettingFilter();
	const list = useSettingList({ graph: filter.graph });
	const deleteSetting = useSettingDelete({ onDeleteSuccess: list.handleRefresh });
	const archiveSetting = useSettingArchive({ onSuccess: list.handleRefresh });
	const previewSetting = useSettingPreview();

	const contextValue: SettingListPageContextValue = useMemo(() => ({
		filter,
		list,
		deleteSetting,
		archiveSetting,
		previewSetting,
	}), [filter, list, deleteSetting, archiveSetting, previewSetting]);

	return (
		<SettingListPageContext.Provider value={contextValue}>
			{props.children}
		</SettingListPageContext.Provider>
	);
}

export function useSettingListPageContext() {
	const context = useContext<SettingListPageContextValue | null>(SettingListPageContext);
	if (!context) throw new Error('useSettingListPageContext must be used within SettingListPageProvider');
	return context;
}


export interface UseSettingListPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelActionItem[];
	viewModeConfig: {
		value: SettingListViewMode,
		onChange: (mode: SettingListViewMode) => void,
		segments: SettingListViewMode[],
	};
}

export function useSettingListPageConfig(): UseSettingListPageConfigReturn {
	const context = useSettingListPageContext();
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');
	const [viewMode, setViewMode] = useState<SettingListViewMode>('list');

	const { handleRefresh } = context.list;

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('settings.title'), href: '#' },
	], [translate]);

	const actions = useMemo(() => [
		{
			label: translate('action.create'),
			leftSection: <IconPlus size={16} />,
			onClick: () => navigate('../settings/create'),
		},
		{
			label: translate('action.refresh'),
			leftSection: <IconRefresh size={16} />,
			onClick: handleRefresh,
			variant: 'outline' as const,
		},
	], [handleRefresh, translate, navigate]);

	const viewModeConfig = useMemo(() => ({
		value: viewMode,
		onChange: (mode: SettingListViewMode) => setViewMode(mode),
		segments: ['list', 'grid'] as SettingListViewMode[],
	}), [viewMode]);

	return { breadcrumbs, actions, viewModeConfig };
}

export const useSettingListPageActions = () => {
	const context = useSettingListPageContext();
	return {
		delete: context.deleteSetting,
		archive: context.archiveSetting,
		preview: context.previewSetting,
	};
};
