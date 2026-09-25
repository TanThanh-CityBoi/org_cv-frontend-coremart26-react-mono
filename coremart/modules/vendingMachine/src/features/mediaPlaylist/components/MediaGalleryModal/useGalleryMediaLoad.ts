import React from 'react';


import { useKioskMediaFilter, useKioskMediaList } from '../../hooks';
import { mapKioskMediaToGalleryMedia } from '../../kioskMediaService';

import type { GalleryMedia } from '../../types';
import type { ControlPanelFilterConfig } from '@/components/ControlPanel/types';
import type { TablePaginationProps } from '@nikkierp/ui/components';
import type { TFunction } from 'i18next';


function resolveGalleryError(
	opened: boolean,
	baseApiUrl: string | undefined,
	error: string | null,
	translate: TFunction,
): string | null {
	if (opened && !baseApiUrl) {
		return translate('coremart.vendingMachine.mediaPlaylist.media.gallery.config_missing');
	}
	if (error) {
		return translate('coremart.vendingMachine.mediaPlaylist.media.gallery.load_failed', { message: error });
	}
	return null;
}

export function useGalleryMediaLoad(
	opened: boolean,
	baseApiUrl: string | undefined,
	translate: TFunction,
): {
	media: GalleryMedia[];
	loadingGallery: boolean;
	galleryError: string | null;
	filters: ControlPanelFilterConfig[];
	pagination: TablePaginationProps;
	handleRefresh: () => void;
	refreshLoading: boolean;
	totalItems: number;
} {
	const { filters, graph, resetSearch } = useKioskMediaFilter();
	const listEnabled = opened && !!baseApiUrl;
	const {
		items,
		isLoadingList,
		loading,
		error,
		handleRefresh,
		pagination,
	} = useKioskMediaList({ graph, enabled: listEnabled });

	React.useEffect(() => {
		if (!opened) resetSearch();
	}, [opened, resetSearch]);

	const galleryError = React.useMemo(
		() => resolveGalleryError(opened, baseApiUrl, error, translate),
		[opened, baseApiUrl, error, translate],
	);

	const media = React.useMemo(() => {
		if (!baseApiUrl || !listEnabled) return [];
		return items.map((km) => mapKioskMediaToGalleryMedia(km, baseApiUrl));
	}, [items, baseApiUrl, listEnabled]);

	return {
		media,
		loadingGallery: isLoadingList,
		galleryError,
		filters,
		pagination,
		handleRefresh,
		refreshLoading: loading,
		totalItems: pagination.totalItems ?? 0,
	};
}
