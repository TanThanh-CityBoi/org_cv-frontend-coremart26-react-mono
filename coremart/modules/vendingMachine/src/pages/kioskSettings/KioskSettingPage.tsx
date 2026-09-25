import { useDocumentTitle } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from '@/components';
import { ControlPanelProps, ViewMode } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import {
	ArchiveKioskSettingModal,
	DeleteKioskSettingModal,
	KioskSettingDetailDrawer,
	KioskSettingGridView,
	KioskSettingTable,
	kioskSettingSchema,
	useKioskSettingArchive,
	useKioskSettingDelete,
	useKioskSettingFilter,
	useKioskSettingList,
	useKioskSettingPageConfig,
	useKioskSettingPreview,
	KioskSettingListViewMode,
	type KioskSettingTableActions,
} from '@/features/kioskSettings';
import { KioskSetting } from '@/features/kioskSettings/types';


export const KioskSettingPage: React.FC = () => {
	const {
		settings = [],
		isLoadingList,
		handleRefresh,
		pagination,
	} = useKioskSettingList();

	const { filteredSettings, filters, searchValue, setSearchValue } = useKioskSettingFilter(settings);

	const { isOpenPreview, handlePreview,
		handleClosePreview, selectedSetting, isLoadingPreview } = useKioskSettingPreview();

	const {
		isOpenDeleteModal,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		settingToDelete,
		handleDelete: handleDeleteSetting,
	} = useKioskSettingDelete(handleRefresh);

	const archive = useKioskSettingArchive({ onSuccess: handleRefresh });

	const navigate = useNavigate();
	const handleViewDetail = (setting: KioskSetting) => {
		navigate(`../kiosk-settings/${setting.id}`);
	};

	const tableActions: KioskSettingTableActions = {
		preview: handlePreview,
		archive: archive.handleOpenArchiveModal,
		restore: archive.handleOpenRestoreModal,
		delete: handleOpenDeleteModal,
		viewDetail: handleViewDetail,
	};

	const { breadcrumbs, actions, viewMode, setViewMode } = useKioskSettingPageConfig({ handleRefresh });

	useDocumentTitle('coremart.vendingMachine.kioskSettings.title');

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				sections={[
					<KioskSettingListControlPanel
						key='kiosk-setting-list-control-panel'
						actions={actions}
						searchValue={searchValue}
						setSearchValue={setSearchValue}
						filters={filters}
						viewMode={viewMode}
						setViewMode={setViewMode}
					/>,
				]}
				isLoading={isLoadingList}
				isEmpty={!filteredSettings?.length && !isLoadingList}
			>
				<KioskSettingListPageContent
					settings={filteredSettings}
					isLoading={isLoadingList}
					viewMode={viewMode}
					pagination={pagination}
					actions={tableActions}
				/>
			</PageContainer>

			<DeleteKioskSettingModal
				opened={!!settingToDelete && isOpenDeleteModal}
				onClose={handleCloseDeleteModal}
				onConfirm={() => handleDeleteSetting(settingToDelete?.id || '')}
				name={settingToDelete?.name || ''}
			/>
			<ArchiveKioskSettingModal
				opened={!!archive.pendingArchive && archive.isOpenArchiveModal}
				onClose={archive.handleCloseArchiveModal}
				onConfirm={archive.handleConfirmArchive}
				type={archive.pendingArchive?.targetArchived ? 'archive' : 'restore'}
				name={archive.pendingArchive?.setting?.name ?? ''}
			/>

			<KioskSettingDetailDrawer
				opened={isOpenPreview}
				onClose={handleClosePreview}
				setting={selectedSetting}
				isLoading={isLoadingPreview}
			/>
		</>
	);
};


interface KioskSettingListControlPanelProps {
	actions: ControlPanelProps['actions'];
	searchValue: string;
	setSearchValue: (value: string) => void;
	filters: ControlPanelProps['filters'];
	viewMode: KioskSettingListViewMode;
	setViewMode: (value: KioskSettingListViewMode) => void;
}

const KioskSettingListControlPanel: React.FC<KioskSettingListControlPanelProps> =
	({ actions, searchValue, setSearchValue, filters, viewMode, setViewMode }) => {
		const { t: translate } = useTranslation();
		return (
			<ControlPanel
				key='control-panel'
				actions={actions}
				search={{
					value: searchValue,
					onChange: setSearchValue,
					placeholder: translate('coremart.vendingMachine.kioskSettings.search.placeholder'),
				}}
				filters={filters}
				viewMode={{
					value: viewMode,
					onChange: (mode: ViewMode) => setViewMode(mode as KioskSettingListViewMode),
					segments: ['list', 'grid'],
				}}
			/>
		);
	};


interface KioskSettingListPageContentProps {
	settings: KioskSetting[];
	isLoading: boolean;
	viewMode: KioskSettingListViewMode;
	pagination: ReturnType<typeof useKioskSettingList>['pagination'];
	actions: KioskSettingTableActions;
}

const KioskSettingListPageContent: React.FC<KioskSettingListPageContentProps> =
	({ settings, isLoading, viewMode, pagination, actions }) => {
		const kioskSettingListView = useMemo(() => (
			<KioskSettingTable
				columns={['code', 'name', 'description', 'isArchived', 'actions']}
				data={settings as unknown as Record<string, unknown>[]}
				schema={kioskSettingSchema as ModelSchema}
				isLoading={isLoading}
				actions={actions}
				pagination={pagination}
			/>
		), [settings, actions, isLoading, pagination]);

		const kioskSettingGridView = useMemo(() => (
			<KioskSettingGridView
				settings={settings}
				isLoading={isLoading}
				actions={actions}
				pagination={pagination}
			/>
		), [settings, actions, isLoading, pagination]);

		const pageContent = useMemo(() => {
			const views: Partial<Record<ViewMode, React.ReactNode>> = {
				list: kioskSettingListView,
				grid: kioskSettingGridView,
			};
			return views[viewMode] ?? kioskSettingListView;
		}, [viewMode, kioskSettingListView, kioskSettingGridView]);

		return pageContent;
	};
