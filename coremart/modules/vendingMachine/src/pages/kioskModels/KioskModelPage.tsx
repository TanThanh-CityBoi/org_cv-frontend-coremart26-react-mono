import { TablePaginationProps } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { asLegacyModelSchema } from '../../common/helpers';
import { ControlPanel } from '../../components';
import { ControlPanelViewModeProps } from '../../components/ControlPanel/ControlPanelViewMode';
import { PageContainer } from '../../components/PageContainer';
import {
	ArchiveKioskModelModal,
	DeleteKioskModelModal,
	KioskModel,
	KioskModelDetailDrawer,
	KioskModelGridView,
	KioskModelPageProvider,
	KioskModelTable,
	KioskModelTableActions,
	KioskModelViewMode,
	kioskModelSchema,
	useKioskModelPageActions,
	useKioskModelPageConfig,
	useKioskModelPageContext,
} from '../../features/kioskModels';


export const KioskModelPage: React.FC = () => {
	return (
		<KioskModelPageProvider>
			<KioskModelPageContent />
		</KioskModelPageProvider>
	);
};

const KioskModelPageContent: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');

	const { filter: { filters }, list: { models, pagination, isLoading, isEmpty } } = useKioskModelPageContext();
	const { breadcrumbs, actions, viewModeConfig } = useKioskModelPageConfig();
	const { preview, delete: deleteModel, archive } = useKioskModelPageActions();
	const navigate = useNavigate();

	const kioskModelTableActions: KioskModelTableActions = {
		preview: preview.handlePreview,
		viewDetail: (model: KioskModel) => navigate(`../kiosk-models/${model.id}`),
		archive: archive.handleOpenArchiveModal,
		restore: archive.handleOpenRestoreModal,
		delete: deleteModel.handleOpenDeleteModal,
	};

	return (
		<>
			<PageContainer
				isLoading={isLoading}
				isEmpty={isEmpty}
				breadcrumbs={breadcrumbs}
				sections={[
					<ControlPanel
						key='kiosk-model-control'
						actions={actions}
						filters={filters}
						viewMode={viewModeConfig as ControlPanelViewModeProps}
					/>,
				]}
				documentTitle={translate('kiosk_models.title')}
			>
				<KioskModelList
					isLoading={isLoading}
					viewMode={viewModeConfig.value}
					pagination={pagination}
					models={models}
					actions={kioskModelTableActions}
				/>
			</PageContainer>

			<DeleteKioskModelModal
				opened={!!deleteModel.modelToDelete && deleteModel.isOpenDeleteModal}
				onClose={deleteModel.handleCloseDeleteModal}
				onConfirm={deleteModel.handleDelete}
				name={deleteModel.modelToDelete?.name || ''}
			/>
			<ArchiveKioskModelModal
				opened={!!archive.pendingArchive && archive.isOpenArchiveModal}
				onClose={archive.handleCloseModal}
				onConfirm={archive.handleConfirmArchive}
				type={archive.pendingArchive?.targetArchived ? 'archive' : 'restore'}
				name={archive.pendingArchive?.model?.name ?? ''}
			/>
			<KioskModelPreviewDrawer />
		</>
	);
};

const KioskModelPreviewDrawer: React.FC = () => {
	const { preview } = useKioskModelPageActions();

	return (
		<KioskModelDetailDrawer
			opened={preview.isOpenDetailModal}
			onClose={preview.handleCloseDetailModal}
			modelId={preview.selectedModelId || ''}
		/>
	);
};

type KioskModelListProps = {
	models: KioskModel[],
	viewMode: KioskModelViewMode,
	isLoading: boolean,
	pagination: TablePaginationProps,
	actions: KioskModelTableActions,
};

function KioskModelList({
	models,
	viewMode,
	isLoading,
	pagination,
	actions,
}: KioskModelListProps) {
	const KIOSK_MODEL_COLUMNS = [ 'referenceCode', 'name', 'description', 'status', 'actions'];

	switch (viewMode) {
		case 'grid':
			return (
				<KioskModelGridView
					models={models}
					isLoading={isLoading}
					actions={actions}
					pagination={pagination}
				/>
			);
		case 'list':
		default:
			return (
				<KioskModelTable
					columns={KIOSK_MODEL_COLUMNS}
					data={models as unknown as Record<string, unknown>[]}
					schema={asLegacyModelSchema(kioskModelSchema)}
					actions={actions}
					isLoading={isLoading}
					pagination={pagination}
				/>
			);
	}
}
