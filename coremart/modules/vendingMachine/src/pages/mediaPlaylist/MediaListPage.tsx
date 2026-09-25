import { Alert, Group, Loader, Stack } from '@mantine/core';
import { useShellEnvVars } from '@nikkierp/shell/config';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


import { ControlPanel, type ViewMode } from '@/components';
import { PageContainer } from '@/components/PageContainer';
import { TablePagination } from '@/components/Table';
import { type TablePaginationProps } from '@/components/Table';
import {
	ArchiveKioskMediaModal,
	DeleteKioskMediaModal,
	EditKioskMediaNameModal,
	KioskMediaDetailDrawer,
	KioskMediaTable,
	type KioskMediaTableActions,
	kioskMediaSchema,
	useKioskMediaFilter,
	useKioskMediaList,
	useMediaListKioskMutations,
} from '@/features/mediaPlaylist';
import { KioskMediaGrid } from '@/features/mediaPlaylist/components/KioskMediaGrid';
import { mapKioskMediaToGalleryMedia } from '@/features/mediaPlaylist/kioskMediaService';

import type { GalleryMedia, KioskMedia } from '@/features/mediaPlaylist/types';


const noopToggle = (_item: GalleryMedia) => {
	/* read-only grid */
};

interface MediaListMainSectionProps {
	viewMode: ViewMode;
	tableRows: Record<string, unknown>[];
	galleryItems: GalleryMedia[];
	items: KioskMedia[];
	emptyIds: Set<string>;
	isLoadingList: boolean;
	gridConfigError: string | null;
	pagination: TablePaginationProps;
	onGalleryItemOpen: (item: GalleryMedia) => void;
	tableActions: KioskMediaTableActions;
}

function MediaListMainSection({
	viewMode,
	tableRows,
	galleryItems,
	emptyIds,
	isLoadingList,
	gridConfigError,
	pagination,
	onGalleryItemOpen,
	tableActions,
}: MediaListMainSectionProps) {
	const { onView: _onView, ...gridActions } = tableActions;

	return (
		<>
			{viewMode === 'list' ? (
				<KioskMediaTable
					columns={['name', 'mediaType', 'isArchived', 'createdAt', 'actions']}
					data={tableRows}
					schema={kioskMediaSchema as ModelSchema}
					isLoading={isLoadingList}
					pagination={pagination}
					tableActions={tableActions}
				/>
			) : gridConfigError ? (
				<Alert color='yellow'>{gridConfigError}</Alert>
			) : isLoadingList ? (
				<Group justify='center' align='center' mih={240}>
					<Loader />
				</Group>
			) : (
				<Stack gap='sm'>
					<KioskMediaGrid
						readOnly
						items={galleryItems}
						selectedIds={emptyIds}
						selectedMediaIdsInPlaylist={[]}
						alreadyInPlaylistLabel=''
						onToggle={noopToggle}
						onItemOpen={onGalleryItemOpen}
						actions={gridActions}
					/>
					<TablePagination {...pagination} />
				</Stack>
			)}
		</>
	);
}

function useMediaListPageState() {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const envVars = useShellEnvVars();
	const baseApiUrl = envVars.BASE_API_URL;
	const { filters, graph } = useKioskMediaFilter();
	const { items, isLoadingList, loading, error, handleRefresh, pagination } = useKioskMediaList({ graph });
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [detailMedia, setDetailMedia] = useState<KioskMedia | null>(null);

	const {
		tableActions,
		kioskDelete,
		kioskArchive,
		kioskEdit,
	} = useMediaListKioskMutations(detailMedia, setDetailMedia, handleRefresh, baseApiUrl);

	const handleGalleryItemOpen = useCallback(
		(g: GalleryMedia) => {
			const km = items.find((row: KioskMedia) => row.id === g.id);
			if (km) setDetailMedia(km);
		},
		[items],
	);

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
			{ title: translate('coremart.vendingMachine.kioskMedia.title'), href: '#' },
		],
		[translate],
	);

	const tableRows = useMemo(
		() => (items || []).map((km: KioskMedia) => ({ ...km }) as unknown as Record<string, unknown>),
		[items],
	);

	const galleryItems = useMemo(() => {
		if (!baseApiUrl) return [];
		return items.map((km: KioskMedia) => mapKioskMediaToGalleryMedia(km, baseApiUrl));
	}, [items, baseApiUrl]);

	const emptyIds = useMemo(() => new Set<string>(), []);

	const gridConfigError = useMemo(() => {
		if (viewMode !== 'grid' || baseApiUrl) return null;
		return translate('coremart.vendingMachine.mediaPlaylist.media.gallery.config_missing');
	}, [viewMode, baseApiUrl, translate]);

	const showEmpty =
		!isLoadingList &&
		!error &&
		items.length === 0 &&
		(viewMode === 'list' || (viewMode === 'grid' && !gridConfigError && !!baseApiUrl));

	return {
		translate,
		navigate,
		baseApiUrl,
		filters,
		items,
		isLoadingList,
		loading,
		error,
		handleRefresh,
		pagination,
		viewMode,
		setViewMode,
		detailMedia,
		setDetailMedia,
		handleGalleryItemOpen,
		breadcrumbs,
		tableRows,
		galleryItems,
		emptyIds,
		gridConfigError,
		showEmpty,
		tableActions,
		kioskDelete,
		kioskArchive,
		kioskEdit,
	};
}

// eslint-disable-next-line max-lines-per-function -- page shell + modals + list/grid sections
export const MediaListPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const {
		navigate,
		baseApiUrl,
		filters,
		items,
		isLoadingList,
		loading,
		error,
		handleRefresh,
		pagination,
		viewMode,
		setViewMode,
		detailMedia,
		setDetailMedia,
		handleGalleryItemOpen,
		breadcrumbs,
		tableRows,
		galleryItems,
		emptyIds,
		gridConfigError,
		showEmpty,
		tableActions,
		kioskDelete,
		kioskArchive,
		kioskEdit,
	} = useMediaListPageState();

	return (
		<PageContainer
			documentTitle={translate('coremart.vendingMachine.kioskMedia.title')}
			breadcrumbs={breadcrumbs}
			actionBar={
				<ControlPanel
					actions={[
						{
							label: translate('nikki.general.actions.create'),
							leftSection: <IconPlus size={16} />,
							onClick: () => navigate('create'),
						},
						{
							label: translate('nikki.general.actions.refresh'),
							leftSection: <IconRefresh size={16} />,
							onClick: handleRefresh,
							variant: 'outline',
							loading,
						},
					]}
					filters={filters}
					viewMode={{ value: viewMode, onChange: setViewMode, segments: ['list', 'grid'] }}
				/>
			}
		>
			<Stack gap='md'>
				{error ? (
					<Alert color='red' title={translate('nikki.general.messages.error')}>
						{translate('coremart.vendingMachine.kioskMedia.messages.load_failed', { message: error })}
					</Alert>
				) : null}
				<MediaListMainSection
					viewMode={viewMode}
					tableRows={tableRows}
					galleryItems={galleryItems}
					items={items}
					emptyIds={emptyIds}
					isLoadingList={isLoadingList}
					gridConfigError={gridConfigError}
					pagination={pagination}
					onGalleryItemOpen={handleGalleryItemOpen}
					tableActions={tableActions}
				/>
				<KioskMediaDetailDrawer
					opened={detailMedia != null}
					onClose={() => setDetailMedia(null)}
					media={detailMedia ?? undefined}
					baseApiUrl={baseApiUrl}
					onRequestDelete={
						detailMedia ? () => kioskDelete.handleOpenDeleteModal(detailMedia) : undefined
					}
					onRequestArchive={
						detailMedia ? () => kioskArchive.handleOpenArchiveModal(detailMedia) : undefined
					}
					onRequestRestore={
						detailMedia ? () => kioskArchive.handleOpenRestoreModal(detailMedia) : undefined
					}
				/>
				<DeleteKioskMediaModal
					opened={kioskDelete.isOpenDeleteModal}
					onClose={kioskDelete.handleCloseDeleteModal}
					onConfirm={() => void kioskDelete.handleDelete()}
					name={kioskDelete.mediaToDelete?.name ?? ''}
				/>
				<ArchiveKioskMediaModal
					opened={kioskArchive.isOpenArchiveModal}
					onClose={kioskArchive.handleCloseModal}
					onConfirm={() => void kioskArchive.handleConfirmArchive()}
					type={kioskArchive.pendingArchive?.targetArchived ? 'archive' : 'restore'}
					name={kioskArchive.pendingArchive?.media?.name ?? ''}
				/>
				<EditKioskMediaNameModal
					opened={kioskEdit.isOpenEditModal}
					onClose={kioskEdit.handleCloseEditModal}
					name={kioskEdit.nameDraft}
					onNameChange={kioskEdit.setNameDraft}
					onSubmit={() => void kioskEdit.handleSaveName()}
					isSubmitting={kioskEdit.isSaving}
				/>
				{showEmpty ? (
					<Alert color='gray'>{translate('coremart.vendingMachine.kioskMedia.messages.empty')}</Alert>
				) : null}
			</Stack>
		</PageContainer>
	);
};
