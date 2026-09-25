/* eslint-disable max-lines-per-function */
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
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

import { kioskSettingActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { useKioskSettingArchive } from '@/features/kioskSettings/hooks/useKioskSettingArchive';
import {
	formDataToKioskSettingBasicUpdates,
	KioskSettingBasicInfoFormData,
	kioskSettingToFormModelValues,
	useKioskSettingEdit,
} from '@/features/kioskSettings/hooks/useKioskSettingEdit';
import { KIOSK_SETTING_DETAIL_FIELDS } from '@/features/kioskSettings/kioskSettingSlice';
import { kioskSettingSchema } from '@/features/kioskSettings/schemas';

import { KioskSetting } from '../../../types';
import { useRegisterKioskSettingDetailTab } from '../kioskSettingDetailTabControl';
import { useKioskSettingDetailPersistence } from './useKioskSettingDetailPersistence';


export const KIOSK_SETTING_BASIC_INFO_FORM_ID = 'kiosk-setting-basic-info-form';

function buildBasicInfoActions(
	isEditing: boolean,
	isSubmitting: boolean,
	s: KioskSetting,
	translate: ReturnType<typeof useTranslation>['t'],
	handleEdit: () => void,
	handleSave: () => void,
	handleCancel: () => void,
	onArchive: () => void,
	onRestore: () => void,
	handleDelete: () => void,
): ControlPanelProps['actions'] {
	const primary = !isEditing
		? [{
			label: translate('nikki.general.actions.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}]
		: [{
			label: translate('nikki.general.actions.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			type: 'button' as const,
			variant: 'filled' as const,
			disabled: isSubmitting,
			loading: isSubmitting,
		}, {
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting,
		}];

	const archived = Boolean(s.isArchived);
	const archiveAction = archived
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
			onClick: handleDelete,
			type: 'button' as const,
			variant: 'outline' as const,
			color: 'red' as const,
			disabled: isSubmitting || isEditing,
		},
	];
}

type UseKioskSettingBasicInfoTabArgs = {
	setting: KioskSetting;
};

export function useKioskSettingBasicInfoTab({ setting }: UseKioskSettingBasicInfoTabArgs) {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
	const [formResetNonce, setFormResetNonce] = useState(0);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();

	const closeDeleteModal = useCallback(() => setIsOpenDeleteModal(false), []);

	const { onDelete } = useKioskSettingDetailPersistence(setting, {
		onDeleteSuccess: closeDeleteModal,
	});

	const onArchiveSuccess = useCallback(() => {
		if (setting.id) {
			dispatch(kioskSettingActions.getKioskSetting({
				id: setting.id,
				fields: KIOSK_SETTING_DETAIL_FIELDS,
			}));
		}
	}, [setting.id, dispatch]);

	const {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseArchiveModal,
		isOpenArchiveModal,
		pendingArchive,
	} = useKioskSettingArchive({ onSuccess: onArchiveSuccess });

	const { isSubmitting, handleSubmit } = useKioskSettingEdit(setting, {
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (setting.id) {
				dispatch(kioskSettingActions.getKioskSetting({
					id: setting.id,
					fields: KIOSK_SETTING_DETAIL_FIELDS,
				}));
			}
		},
	});

	const modelSchema = kioskSettingSchema as ModelSchema;

	const onFormSubmit = useCallback((data: KioskSettingBasicInfoFormData) => {
		handleSubmit(formDataToKioskSettingBasicUpdates(data));
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(KIOSK_SETTING_BASIC_INFO_FORM_ID);
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const onEditClick = useCallback(() => {
		setIsEditing(true);
	}, []);

	const onCancelClick = useCallback(() => {
		setFormResetNonce((n) => n + 1);
		setIsEditing(false);
	}, []);

	const onDeleteClick = useCallback(() => setIsOpenDeleteModal(true), []);

	const confirmDelete = useCallback(() => {
		onDelete();
	}, [onDelete]);

	const actions = useMemo(
		() => buildBasicInfoActions(
			isEditing,
			isSubmitting,
			setting,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			() => handleOpenArchiveModal(setting),
			() => handleOpenRestoreModal(setting),
			onDeleteClick,
		),
		[
			isEditing, isSubmitting, setting, translate,
			onEditClick, onSaveClick, onCancelClick,
			handleOpenArchiveModal, handleOpenRestoreModal, onDeleteClick,
		],
	);

	const modelValue = useMemo(
		() => kioskSettingToFormModelValues(setting),
		[setting, formResetNonce],
	);

	useRegisterKioskSettingDetailTab('basicInfo', actions);

	return {
		formId: KIOSK_SETTING_BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		modelValue,
		onFormSubmit,
		closeDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
	};
}
