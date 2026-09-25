import { ModelSchema } from '@nikkierp/ui/model';
import {
	IconArchive, IconArrowLeft, IconDeviceFloppy, IconEdit, IconRefresh, IconTrash, IconX,
} from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { settingActions, selectSetArchivedSetting, VendingMachineDispatch } from '@/appState';
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelActionItem } from '@/components/ControlPanel';
import {
	SettingCreateFormData,
	settingToCreateFormValues,
	formDataToSettingUpdateBody,
} from '@/features/settings/hooks/useSettingCreate';
import { useSettingDelete } from '@/features/settings/hooks/useSettingDelete';
import { useSettingEdit } from '@/features/settings/hooks/useSettingEdit';
import { settingSchema } from '@/features/settings';
import { Setting } from '@/features/settings/types';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';

import type {
	UseSettingDetailPageConfigProps,
	UseSettingDetailPageConfigReturn,
} from './types';


export const SETTING_BASIC_INFO_FORM_ID = 'setting-basic-info-form';

export const useSettingDetailBreadcrumbs = ({ setting }: { setting?: Setting }): BreadcrumbItem[] => {
	const { t: translate } = useTranslation();

	return useMemo(() => [
		{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
		{ title: translate('coremart.vendingMachine.settings.title'), href: '../settings' },
		{ title: setting?.name || translate('coremart.vendingMachine.settings.detail.title'), href: '#' },
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
	const { t: translate } = useTranslation();

	return useMemo<ControlPanelActionItem[]>(() => {
		const backAction: ControlPanelActionItem = {
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../settings'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline',
		};

		const editActions: ControlPanelActionItem[] = !isEditing
			? [{
				label: translate('nikki.general.actions.edit'),
				leftSection: <IconEdit size={16} />,
				onClick: onEditClick,
				type: 'button',
				variant: 'filled',
			}]
			: [{
				label: translate('nikki.general.actions.save'),
				leftSection: <IconDeviceFloppy size={16} />,
				onClick: onSaveClick,
				type: 'button',
				variant: 'filled',
				disabled: isSubmitting,
				loading: isSubmitting,
			}, {
				label: translate('nikki.general.actions.cancel'),
				leftSection: <IconX size={16} />,
				onClick: onCancelClick,
				type: 'button',
				variant: 'outline',
				disabled: isSubmitting,
			}];

		const archiveAction: ControlPanelActionItem = {
			label: isArchived
				? translate('nikki.general.actions.restore')
				: translate('nikki.general.actions.archive'),
			leftSection: isArchived ? <IconRefresh size={16} /> : <IconArchive size={16} />,
			onClick: onArchiveClick,
			type: 'button',
			variant: 'outline',
			disabled: isSubmitting || isArchiving,
			loading: isArchiving,
		};

		const deleteAction: ControlPanelActionItem = {
			label: translate('nikki.general.actions.delete'),
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
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const { t: translate } = useTranslation();
	const archiveState = useMicroAppSelector(selectSetArchivedSetting);
	const archiveRequestIdRef = React.useRef<string | null>(null);

	const handleArchive = useCallback(() => {
		if (!setting) return;
		const action = dispatch(settingActions.setArchivedSetting({
			id: setting.id,
			etag: setting.etag,
			isArchived: !setting.isArchived,
		}));
		archiveRequestIdRef.current = action.requestId;
	}, [dispatch, setting]);

	React.useEffect(() => {
		const requestId = archiveState.requestId;
		const matchesDispatch = requestId != null && requestId === archiveRequestIdRef.current;
		if (!matchesDispatch) return;

		if (archiveState.status === 'success') {
			archiveRequestIdRef.current = null;
			dispatch(settingActions.resetSetArchivedSetting());
			dispatch(settingActions.getSetting(setting!.id));
		}
		if (archiveState.status === 'error') {
			archiveRequestIdRef.current = null;
			dispatch(settingActions.resetSetArchivedSetting());
		}
	}, [archiveState, dispatch, setting, translate]);

	return {
		handleArchive,
		isArchiving: archiveState.status === 'pending',
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

	const modelSchema = settingSchema as ModelSchema;

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
