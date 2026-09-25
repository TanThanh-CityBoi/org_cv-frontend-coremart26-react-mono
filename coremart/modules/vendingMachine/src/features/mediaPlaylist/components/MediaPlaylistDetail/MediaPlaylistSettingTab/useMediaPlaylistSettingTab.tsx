/* eslint-disable max-lines-per-function */
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import {
	IconArchive,
	IconDeviceFloppy,
	IconEdit,
	IconRestore,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { mediaPlaylistActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { usePlaylistArchive } from '@/features/mediaPlaylist/hooks/usePlaylistArchive';
import { usePlaylistDelete } from '@/features/mediaPlaylist/hooks/usePlaylistDelete';

import { useRegisterMediaPlaylistDetailTab } from '../mediaPlaylistDetailTabControl';

import type { Playlist } from '@/features/mediaPlaylist/types';



function buildToolbarActions(
	isEditing: boolean,
	isSubmitting: boolean,
	playlist: Playlist,
	translate: ReturnType<typeof useTranslation>['t'],
	onEdit: () => void,
	onSave: () => void,
	onCancel: () => void,
	onDelete: () => void,
	onArchive: () => void,
	onRestore: () => void,
): ControlPanelProps['actions'] {
	const primary = !isEditing
		? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: onEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}]
		: [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: onSave,
			type: 'button' as const,
			variant: 'filled' as const,
			disabled: isSubmitting,
			loading: isSubmitting,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: onCancel,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting,
		}];

	const archiveAction = playlist.isArchived
		? {
			label: translate('nikki.general.actions.restore'),
			leftSection: <IconRestore size={16} />,
			onClick: onRestore,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting || isEditing,
		}
		: {
			label: translate('nikki.general.actions.archive'),
			leftSection: <IconArchive size={16} />,
			onClick: onArchive,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting || isEditing,
			color: 'orange' as const,
		};

	return [
		...primary,
		archiveAction,
		{
			label: translate('nikki.general.actions.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: onDelete,
			type: 'button' as const,
			variant: 'outline' as const,
			color: 'red' as const,
			disabled: isSubmitting || isEditing,
		},
	];
}

export type useMediaPlaylistSettingTabParams = {
	playlist?: Playlist;
	onSave: () => void | Promise<void>;
	isSubmitting: boolean;
};

export type useMediaPlaylistSettingTabReturn = {
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
	formResetNonce: number;
	isSubmitting: boolean;
	onSaveClick: () => void;
	closeDeleteModal: () => void;
	confirmDelete: () => void;
	isOpenDeleteModal: boolean;
	isOpenArchiveModal: boolean;
	pendingArchive: { playlist: Playlist; targetArchived: boolean } | null;
	handleConfirmArchive: () => void;
	handleCloseArchiveModal: () => void;
	playlistForDelete: Playlist | null;
};

export function useMediaPlaylistSettingTab({
	playlist,
	onSave,
	isSubmitting,
}: useMediaPlaylistSettingTabParams): useMediaPlaylistSettingTabReturn {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const [formResetNonce, setFormResetNonce] = useState(0);

	const onArchiveSuccess = useCallback(() => {
		if (playlist?.id) {
			dispatch(mediaPlaylistActions.getMediaPlaylist(playlist.id));
		}
	}, [playlist?.id, dispatch]);

	const {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal: handleCloseArchiveModal,
		isOpenArchiveModal,
		pendingArchive,
	} = usePlaylistArchive({ onArchiveSuccess });

	const {
		handleDelete: dispatchDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		playlistToDelete,
	} = usePlaylistDelete({ onDeleteSuccess: () => navigate('..') });

	const onSaveClick = useCallback(() => {
		void onSave();
	}, [onSave]);

	const onEditClick = useCallback(() => setIsEditing(true), [setIsEditing]);
	const onCancelClick = useCallback(() => {
		setFormResetNonce((n) => n + 1);
		setIsEditing(false);
	}, [setIsEditing]);

	const onDeleteClick = useCallback(() => {
		if (playlist) {
			handleOpenDeleteModal(playlist);
		}
	}, [playlist, handleOpenDeleteModal]);

	const confirmDelete = useCallback(() => {
		if (playlist) {
			dispatchDelete(playlist.id);
		}
		handleCloseDeleteModal();
	}, [dispatchDelete, playlist, handleCloseDeleteModal]);

	const onArchiveClick = useCallback(() => {
		if (playlist) {
			handleOpenArchiveModal(playlist);
		}
	}, [playlist, handleOpenArchiveModal]);

	const onRestoreClick = useCallback(() => {
		if (playlist) {
			handleOpenRestoreModal(playlist);
		}
	}, [playlist, handleOpenRestoreModal]);

	const panelActions = useMemo(() => {
		if (!playlist) {
			return [];
		}
		return buildToolbarActions(
			isEditing,
			isSubmitting,
			playlist,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			onDeleteClick,
			onArchiveClick,
			onRestoreClick,
		);
	}, [
		playlist, isEditing, isSubmitting, translate,
		onEditClick, onSaveClick, onCancelClick, onDeleteClick, onArchiveClick, onRestoreClick,
	]);
	useRegisterMediaPlaylistDetailTab('settings', panelActions);

	return useMemo(() => ({
		formResetNonce,
		isEditing,
		setIsEditing,
		isSubmitting,
		onSaveClick,
		closeDeleteModal: handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
		playlistForDelete: playlistToDelete,
	}), [
		formResetNonce,
		isEditing,
		setIsEditing,
		isSubmitting,
		onSaveClick,
		handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
		playlistToDelete,
	]);
}


