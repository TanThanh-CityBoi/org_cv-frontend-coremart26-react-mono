import { useUIState } from '@nikkierp/shell/contexts';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { getKioskMediaStreamUrl, kioskMediaService } from '../kioskMediaService';
import { useKioskMediaArchive } from './useKioskMediaArchive';
import { useKioskMediaDelete } from './useKioskMediaDelete';
import { useKioskMediaEditName } from './useKioskMediaEditName';

import type { KioskMediaTableActions } from '../components/KioskMediaTable/KioskMediaTable';
import type { KioskMedia } from '../types';
import type { Dispatch, SetStateAction } from 'react';


// eslint-disable-next-line max-lines-per-function -- composes delete/archive hooks + list table action map
export function useMediaListKioskMutations(
	detailMedia: KioskMedia | null,
	setDetailMedia: Dispatch<SetStateAction<KioskMedia | null>>,
	handleRefresh: () => void,
	baseApiUrl: string | undefined,
) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation('vending_machine');
	const detailMediaRef = useRef<KioskMedia | null>(null);
	detailMediaRef.current = detailMedia;

	const syncDetailAfterMutation = useCallback(async () => {
		const cur = detailMediaRef.current;
		if (!cur) return;
		try {
			const fresh = await kioskMediaService.getKioskMediaById(cur.id);
			setDetailMedia(fresh);
		}
		catch {
			setDetailMedia(null);
		}
	}, [setDetailMedia]);

	const kioskDelete = useKioskMediaDelete({
		onDeleteSuccess: (deletedId) => {
			handleRefresh();
			if (detailMediaRef.current?.id === deletedId) {
				setDetailMedia(null);
			}
		},
	});

	const kioskArchive = useKioskMediaArchive({
		onArchiveSuccess: () => {
			handleRefresh();
			void syncDetailAfterMutation();
		},
	});

	const kioskEdit = useKioskMediaEditName({
		onEditSuccess: () => {
			handleRefresh();
			void syncDetailAfterMutation();
		},
	});

	const openKioskMediaDetail = useCallback((km: KioskMedia) => {
		setDetailMedia(km);
	}, [setDetailMedia]);

	const handleDownloadKioskMedia = useCallback(
		(km: KioskMedia) => {
			if (!baseApiUrl) {
				notification.showError(
					translate('media_playlist.media.gallery.config_missing'),
					translate('messages.error'),
				);
				return;
			}
			const url = getKioskMediaStreamUrl(km.id, baseApiUrl);
			const safeName = (km.name || km.id).replace(/[/\\?%*:|"<>]/g, '_');
			const link = document.createElement('a');
			link.href = url;
			link.download = safeName;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			document.body.appendChild(link);
			link.click();
			link.remove();
		},
		[baseApiUrl, notification, translate],
	);

	const tableActions = useMemo<KioskMediaTableActions>(
		() => ({
			onView: openKioskMediaDetail,
			onEdit: kioskEdit.handleOpenEditModal,
			onDownload: handleDownloadKioskMedia,
			onDelete: kioskDelete.handleOpenDeleteModal,
			onArchive: kioskArchive.handleOpenArchiveModal,
			onRestore: kioskArchive.handleOpenRestoreModal,
		}),
		[
			openKioskMediaDetail,
			kioskEdit.handleOpenEditModal,
			handleDownloadKioskMedia,
			kioskDelete.handleOpenDeleteModal,
			kioskArchive.handleOpenArchiveModal,
			kioskArchive.handleOpenRestoreModal,
		],
	);

	return {
		openKioskMediaDetail,
		tableActions,
		kioskDelete,
		kioskArchive,
		kioskEdit,
	};
}
