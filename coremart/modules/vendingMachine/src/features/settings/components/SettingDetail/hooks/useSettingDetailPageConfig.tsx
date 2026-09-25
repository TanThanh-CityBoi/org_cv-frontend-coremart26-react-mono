import { useServiceLayer } from '@nikkierp/ui/appState/store';
import {
	IconArchive, IconArrowLeft, IconDeviceFloppy, IconEdit, IconRefresh, IconTrash, IconX,
} from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { settingSchema } from '../../..';
import { asLegacyModelSchema } from '../../../../../common/helpers';
import { BreadcrumbItem } from '../../../../../components/BreadCrumbs';
import { ControlPanelActionItem } from '../../../../../components/ControlPanel';
import {
	SettingCreateFormData,
	settingToCreateFormValues,
	formDataToSettingUpdateBody,
} from '../../../hooks/useSettingCreate';
import { useSettingDelete } from '../../../hooks/useSettingDelete';
import { useSettingEdit } from '../../../hooks/useSettingEdit';
import { settingStoreService } from '../../../settingStoreService';
import { Setting } from '../../../types';

import type {
	UseSettingDetailPageConfigProps,
	UseSettingDetailPageConfigReturn,
} from './types';


export const SETTING_BASIC_INFO_FORM_ID = 'setting-basic-info-form';

export const useSettingDetailBreadcrumbs = ({ setting }: { setting?: Setting }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation('vending_machine');

	return useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('settings.title'), href: '../settings' },
		{ title: setting?.name || translate('settings.detail.title'), href: '#' },
	], [setting?.name, translate]);
};

function useSettingDetailActions(
	isEditing: boolean,
	isSubmitting: boolean,
	isArchived: boolean,
	isArchiving: boolean,
	onEditClick: () => void,
	onSaveClick: () => void,
	onCancelClick: () => void,
	onDeleteClick: () => void,
	onArchiveClick: () => void,
): ControlPanelActionItem[] {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');

	return useMemo<ControlPanelActionItem[]>(() => {
		const backAction: ControlPanelActionItem = {
			label: translate('action.back'),
			onClick: () => navigate('../settings'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		};

		const editActions: ControlPanelActionItem[] = !isEditing
			? [{
				label: translate('action.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: onEditClick,
				type: 'button',
				variant: 'filled',
			}]
			: [{
				label: translate('action.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: onSaveClick,
				type: 'button',
				variant: 'filled',
				disabled: isSubmitting,
				loading: isSubmitting,
			}, {
				label: translate('action.cancel'),
				leftSection: <IconX size={16} />,
				onClick: onCancelClick,
				type: 'button',
				variant: 'outline',
				disabled: isSubmitting,
			}];

		const archiveAction: ControlPanelActionItem = {
			label: isArchived
				? translate('action.restore')
				: translate('action.archive'),
			leftSection: isArchived ? <IconRefresh size={16} /> : <IconArchive size={16} />,
			onClick: onArchiveClick,
			type: 'button',
			variant: 'outline',
			disabled: isSubmitting || isArchiving,
			loading: isArchiving,
		};

		const deleteAction: ControlPanelActionItem = {
			label: translate('action.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: onDeleteClick,
			type: 'button',
			variant: 'outline',
			color: 'red',
			disabled: isSubmitting || isArchiving,
		};

		return [backAction, ...editActions, archiveAction, deleteAction];
	}, [translate, navigate, isEditing, isSubmitting, isArchived, isArchiving,
		onEditClick, onSaveClick, onCancelClick, onDeleteClick, onArchiveClick]);
}

function useArchiveHandler(setting: UseSettingDetailPageConfigProps['setting']) {
	const { dispatchMethod: setArchived, result } = useServiceLayer(settingStoreService.setIsArchived);
	const { dispatchMethod: reloadSetting } = useServiceLayer(settingStoreService.getById);
	const settingId = setting?.id;

	const handleArchive = useCallback(() => {
		if (!setting) return;
		setArchived({ id: setting.id, etag: setting.etag, isArchived: !setting.isArchived });
	}, [setArchived, setting]);

	// Archive and detail hold separate service-layer results, so refresh the detail explicitly.
	// This hook shows no notification of its own, matching the slice version it replaces.
	const doneAt = result.doneAt;
	React.useEffect(() => {
		if (doneAt == null || !result.isSuccess || !settingId) return;
		reloadSetting({ id: settingId });
	}, [doneAt, result.isSuccess, settingId, reloadSetting]);

	return {
		handleArchive,
		isArchiving: result.isPending,
	};
}

export function useSettingDetailPageConfig(
	{ setting }: UseSettingDetailPageConfigProps,
): UseSettingDetailPageConfigReturn {
	const navigate = useNavigate();
	const breadcrumbs = useSettingDetailBreadcrumbs({ setting });
	const [isEditing, setIsEditing] = useState(false);

	const onUpdateSuccess = useCallback(() => setIsEditing(false), []);
	const { isSubmitting, handleSubmit } = useSettingEdit(setting, { onUpdateSuccess });

	const onFormSubmit = useCallback((data: SettingCreateFormData) => {
		handleSubmit(formDataToSettingUpdateBody(data));
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(SETTING_BASIC_INFO_FORM_ID);
		if (el instanceof HTMLFormElement) el.requestSubmit();
	}, []);

	const onEditClick = useCallback(() => setIsEditing(true), []);
	const onCancelClick = useCallback(() => setIsEditing(false), []);

	const onDeleteSuccess = useCallback(() => {
		navigate('../settings');
	}, [navigate]);

	const {
		handleDelete: dispatchDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
	} = useSettingDelete({ onDeleteSuccess });

	const onDeleteClick = useCallback(
		() => { if (setting) handleOpenDeleteModal(setting); },
		[setting, handleOpenDeleteModal],
	);

	const confirmDelete = useCallback(() => {
		dispatchDelete();
	}, [dispatchDelete]);

	const { handleArchive, isArchiving } = useArchiveHandler(setting);

	const actions = useSettingDetailActions(
		isEditing, isSubmitting,
		setting?.isArchived ?? false, isArchiving,
		onEditClick, onSaveClick, onCancelClick, onDeleteClick, handleArchive,
	);

	const modelSchema = asLegacyModelSchema(settingSchema);

	const modelValue = useMemo(
		() => setting ? settingToCreateFormValues(setting) : undefined,
		[setting?.id, setting?.etag],
	);

	return useMemo(() => ({
		breadcrumbs,
		actions,
		formProps: {
			formId: SETTING_BASIC_INFO_FORM_ID,
			isEditing,
			isSubmitting,
			modelSchema,
			modelValue,
			onFormSubmit,
			closeDeleteModal: handleCloseDeleteModal,
			confirmDelete,
			isOpenDeleteModal,
		},
	}), [breadcrumbs, actions, isEditing, isSubmitting,
		modelSchema, modelValue, onFormSubmit,
		handleCloseDeleteModal, confirmDelete, isOpenDeleteModal]);
}
