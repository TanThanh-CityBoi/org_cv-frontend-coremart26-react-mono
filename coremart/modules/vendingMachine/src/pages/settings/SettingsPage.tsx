import { TablePaginationProps } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { asLegacyModelSchema } from '../../common/helpers';
import { ControlPanel } from '../../components';
import { ControlPanelViewModeProps } from '../../components/ControlPanel/ControlPanelViewMode';
import { PageContainer } from '../../components/PageContainer';
import {
	ArchiveSettingModal,
	DeleteSettingModal,
	SettingDetailDrawer,
	SettingGridView,
	SettingListViewMode,
	SettingTable,
	SettingTableActions,
	settingSchema,
	Setting,
	SettingListPageProvider,
	useSettingListPageActions,
	useSettingListPageConfig,
	useSettingListPageContext,
} from '../../features/settings';


export const SettingsPage: React.FC = () => {
	return (
		<SettingListPageProvider>
			<SettingsPageContent />
		</SettingListPageProvider>
	);
};

const SettingsPageContent: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const { filter, list: { settings, pagination, isLoading, isEmpty } } = useSettingListPageContext();
	const { breadcrumbs, actions, viewModeConfig } = useSettingListPageConfig();
	const { preview, delete: deleteSetting, archive } = useSettingListPageActions();

	const navigate = useNavigate();
	const handleViewDetail = (setting: Setting) => {
		navigate(`../settings/${setting.id}`);
	};

	const settingTableActions: SettingTableActions = {
		preview: preview.handlePreview,
		archive: archive.handleOpenArchiveModal,
		restore: archive.handleOpenRestoreModal,
		delete: deleteSetting.handleOpenDeleteModal,
		viewDetail: handleViewDetail,
	};

	return (
		<PageContainer
			isLoading={isLoading}
			isEmpty={isEmpty}
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanel
					actions={actions}
					filters={filter.filters}
					viewMode={viewModeConfig as ControlPanelViewModeProps}
				/>,
			]}
			documentTitle={translate('settings.title')}
		>
			<SettingList
				isLoading={isLoading}
				settings={settings}
				pagination={pagination}
				viewMode={viewModeConfig.value}
				actions={settingTableActions}
			/>

			<DeleteSettingModal
				opened={!!deleteSetting.settingToDelete && deleteSetting.isOpenDeleteModal}
				onClose={deleteSetting.handleCloseDeleteModal}
				onConfirm={deleteSetting.handleDelete}
				name={deleteSetting.settingToDelete?.name || ''}
			/>

			<ArchiveSettingModal
				opened={!!archive.pendingArchive && archive.isOpenArchiveModal}
				onClose={archive.handleCloseModal}
				onConfirm={archive.handleConfirmArchive}
				type={archive.pendingArchive?.targetArchived ? 'archive' : 'restore'}
				name={archive.pendingArchive?.setting?.name ?? ''}
			/>

			<SettingPreview />
		</PageContainer>
	);
};

const SettingPreview = () => {
	const { preview } = useSettingListPageActions();

	if (!preview.selectedSetting) return null;

	return (
		<SettingDetailDrawer
			opened={preview.isOpenPreview}
			onClose={preview.handleClosePreview}
			setting={preview.selectedSetting}
			isLoading={preview.isLoadingPreview}
		/>
	);
};

interface SettingListProps {
	isLoading: boolean;
	settings: Setting[];
	pagination: TablePaginationProps;
	viewMode: SettingListViewMode;
	actions: SettingTableActions;
}

const SettingList: React.FC<SettingListProps> = ({
	isLoading,
	settings,
	pagination,
	viewMode,
	actions,
}) => {
	const tableColumns = ['code', 'name', 'description', 'isArchived', 'actions'];

	switch (viewMode) {
		case 'grid':
			return (
				<SettingGridView
					settings={settings}
					actions={actions}
					pagination={pagination}
				/>
			);
		case 'list':
		default:
			return (
				<SettingTable
					isLoading={isLoading}
					columns={tableColumns}
					data={settings as unknown as Record<string, unknown>[]}
					schema={asLegacyModelSchema(settingSchema)}
					actions={actions}
					pagination={pagination}
				/>
			);
	}
};
