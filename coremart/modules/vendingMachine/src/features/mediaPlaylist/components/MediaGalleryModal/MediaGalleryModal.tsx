/* eslint-disable max-lines-per-function */
import { Divider, Modal } from '@mantine/core';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GalleryBrowsePanel } from './GalleryBrowsePanel';
import { SelectedMediaStrip } from './SelectedMediaStrip';
import { useGalleryMediaLoad } from './useGalleryMediaLoad';

import type { GalleryMedia } from '../../types';


export interface MediaGalleryModalProps {
	opened: boolean;
	onClose: () => void;
	onSelectMedia: (media: GalleryMedia[]) => void | Promise<void>;
	/** `kioskMediaRef` của các clip đã có trong playlist (để đánh dấu đã chọn). */
	selectedMediaIds?: string[];
	/** Base API URL (ví dụ `BASE_API_URL`) cho stream kiosk media. */
	baseApiUrl: string;
}



export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
	opened,
	onClose,
	onSelectMedia,
	selectedMediaIds = [],
	baseApiUrl,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const {
		media,
		loadingGallery,
		galleryError,
		filters,
		pagination,
		handleRefresh,
		refreshLoading,
		totalItems,
	} = useGalleryMediaLoad(opened, baseApiUrl, translate);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedMedia, setSelectedMedia] = useState<GalleryMedia[]>([]);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const selectedIds = useMemo(
		() => new Set(selectedMedia.map((m) => m.id)),
		[selectedMedia],
	);

	const handleToggleMedia = (mediaItem: GalleryMedia) => {
		setSelectedMedia((prev) => {
			const exists = prev.find((m) => m.id === mediaItem.id);
			if (exists) return prev.filter((m) => m.id !== mediaItem.id);
			return [...prev, mediaItem];
		});
	};

	const handleConfirm = async () => {
		const mediaWithDurations = selectedMedia.map((item) => ({
			...item,
			duration: item.duration ?? (item.type === 'image' ? 15 : undefined),
		}));
		setConfirmLoading(true);
		try {
			await Promise.resolve(onSelectMedia(mediaWithDurations));
			setSelectedMedia([]);
			onClose();
		}
		finally {
			setConfirmLoading(false);
		}
	};

	const handleCancel = () => {
		setSelectedMedia([]);
		onClose();
	};

	const alreadyLabel = translate('media_playlist.media.gallery.selected');

	return (
		<Modal
			opened={opened}
			onClose={handleCancel}
			title={translate('media_playlist.media.gallery.title')}
			size='xl'
			centered
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<GalleryBrowsePanel
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				galleryError={galleryError}
				loadingGallery={loadingGallery}
				filteredMedia={media}
				filters={filters}
				pagination={pagination}
				onRefresh={handleRefresh}
				refreshLoading={refreshLoading}
				totalItems={totalItems}
				selectedIds={selectedIds}
				selectedMediaIdsInPlaylist={selectedMediaIds}
				alreadyInPlaylistLabel={alreadyLabel}
				onToggleMedia={handleToggleMedia}
			/>
			<Divider my='md' />
			{selectedMedia.length > 0 ? (
				<SelectedMediaStrip
					items={selectedMedia}
					selectedMediaTitle={translate(
						'media_playlist.media.gallery.selected_media',
					)}
					removeAriaLabel={translate('action.remove')}
					cancelLabel={translate('action.cancel')}
					addLabel={translate('action.add')}
					onRemove={handleToggleMedia}
					onCancel={handleCancel}
					onConfirm={handleConfirm}
					confirmLoading={confirmLoading}
				/>
			) : null}
		</Modal>
	);
};
