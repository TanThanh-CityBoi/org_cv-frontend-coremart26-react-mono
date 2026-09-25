import {
	Alert,
	Group,
	Loader,
	ScrollArea,
	Stack,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '@/components';
import { ControlPanelFilterConfig } from '@/components/ControlPanel/types';
import { TablePagination } from '@/components/Table';
import { type TablePaginationProps } from '@/components/Table';

import { GalleryMediaListTable } from './GalleryMediaListTable';
import { KioskMediaGrid } from '../KioskMediaGrid';

import type { GalleryMedia } from '../../types';


export type GalleryViewMode = 'grid' | 'list';

export interface GalleryBrowsePanelProps {
	viewMode: GalleryViewMode;
	onViewModeChange: (mode: GalleryViewMode) => void;
	galleryError: string | null;
	loadingGallery: boolean;
	filteredMedia: GalleryMedia[];
	filters: ControlPanelFilterConfig[];
	pagination: TablePaginationProps;
	onRefresh: () => void;
	refreshLoading: boolean;
	totalItems: number;
	selectedIds: Set<string>;
	selectedMediaIdsInPlaylist: string[];
	alreadyInPlaylistLabel: string;
	onToggleMedia: (item: GalleryMedia) => void;
}

export const GalleryBrowsePanel: React.FC<GalleryBrowsePanelProps> = ({
	viewMode,
	onViewModeChange,
	galleryError,
	loadingGallery,
	filteredMedia,
	filters,
	pagination,
	onRefresh,
	refreshLoading,
	selectedIds,
	selectedMediaIdsInPlaylist,
	alreadyInPlaylistLabel,
	onToggleMedia,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Group align='flex-start' gap='md' wrap='nowrap'>
			<Stack gap='md' style={{ flex: 1, minWidth: 0 }}>
				<ControlPanel
					filters={filters.filter((f) => f.key !== 'isArchived')}
					actions={[
						{
							label: translate('nikki.general.actions.refresh'),
							leftSection: <IconRefresh size={16} />,
							onClick: onRefresh,
							variant: 'outline',
							loading: refreshLoading,
						},
					]}
					viewMode={{ value: viewMode, onChange: (v) => onViewModeChange(v as GalleryViewMode), segments: ['grid', 'list'] }}
				/>
				{galleryError ? (
					<Alert color='red' mb='md' mt='md'>
						{galleryError}
					</Alert>
				) : null}

				<ScrollArea h={360}>
					{loadingGallery ? (
						<Group justify='center' align='center' h={340}>
							<Loader />
						</Group>
					) : viewMode === 'grid' ? (
						<KioskMediaGrid
							items={filteredMedia}
							selectedIds={selectedIds}
							selectedMediaIdsInPlaylist={selectedMediaIdsInPlaylist}
							alreadyInPlaylistLabel={alreadyInPlaylistLabel}
							onToggle={onToggleMedia}
							actions={{}}
							cols={{ base: 1, sm: 2, md: 3 }}
						/>
					) : (
						<GalleryMediaListTable
							items={filteredMedia}
							selectedIds={selectedIds}
							selectedMediaIdsInPlaylist={selectedMediaIdsInPlaylist}
							previewLabel={translate('coremart.vendingMachine.mediaPlaylist.media.fields.preview')}
							nameLabel={translate('coremart.vendingMachine.mediaPlaylist.media.fields.name')}
							sizeLabel={translate('coremart.vendingMachine.mediaPlaylist.media.fields.size')}
							alreadyInPlaylistLabel={alreadyInPlaylistLabel}
							onToggle={onToggleMedia}
						/>
					)}
				</ScrollArea>
				{!galleryError ? <TablePagination {...pagination} /> : null}
			</Stack>
		</Group>
	);
};
