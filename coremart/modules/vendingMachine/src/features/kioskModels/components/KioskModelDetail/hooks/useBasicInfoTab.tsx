/* eslint-disable max-lines-per-function */
import { ModelSchema } from '@nikkierp/common/dynamicModel';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
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

import { asLegacyModelSchema } from '../../../../../common/helpers';
import { ControlPanelProps } from '../../../../../components/ControlPanel';
import { useKioskModelArchive } from '../../../hooks/useKioskModelArchive';
import { useKioskModelDelete } from '../../../hooks/useKioskModelDelete';
import { KioskModelUpdateFormData, useKioskModelEdit } from '../../../hooks/useKioskModelEdit';
import { kioskModelCrudService } from '../../../kioskModelService';
import { kioskModelCreateSchema } from '../../../schemas';
import { KioskModel } from '../../../types';
import { useRegisterKioskModelDetailTab } from '../kioskModelDetailTabControl';


export const BASIC_INFO_FORM_ID = 'kiosk-model-basic-info-form';

function buildBasicInfoActions(
	isEditing: boolean,
	isSubmitting: boolean,
	model: KioskModel,
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
			label: translate('action.edit'),
			leftSection: <IconEdit size={16} />,
			onClick: handleEdit,
			type: 'button' as const,
			variant: 'filled' as const,
		}]
		: [{
			label: translate('action.save'),
			leftSection: <IconDeviceFloppy size={16} />,
			onClick: handleSave,
			type: 'button' as const,
			variant: 'filled' as const,
			disabled: isSubmitting,
			loading: isSubmitting,
		}, {
			label: translate('action.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting,
		}];

	const archiveAction = model.isArchived
		? {
			label: translate('action.restore'),
			leftSection: <IconRestore size={16} />,
			onClick: onRestore,
			type: 'button' as const,
			variant: 'outline' as const,
			disabled: isSubmitting || isEditing,
		}
		: {
			label: translate('action.archive'),
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
			label: translate('action.delete'),
			leftSection: <IconTrash size={16} />,
			onClick: handleDelete,
			type: 'button' as const,
			variant: 'outline' as const,
			color: 'red' as const,
			disabled: isSubmitting || isEditing,
		},
	];
}

export type UseBasicInfoTabArgs = {
	model: KioskModel,
};

export type UseBasicInfoTabReturn = {
	formId: string,
	isEditing: boolean,
	isSubmitting: boolean,
	modelSchema: ModelSchema,
	onFormSubmit: (data: KioskModelUpdateFormData) => void,
	closeDeleteModal: () => void,
	confirmDelete: () => void,
	isOpenDeleteModal: boolean,
	isOpenArchiveModal: boolean,
	pendingArchive: { model: KioskModel, targetArchived: boolean } | null,
	handleConfirmArchive: () => void,
	handleCloseArchiveModal: () => void,
};

export function useBasicInfoTab({ model }: UseBasicInfoTabArgs): UseBasicInfoTabReturn {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const { dispatchMethod: refetchModel } = useServiceLayer(kioskModelCrudService.getById);

	const onUpdateSuccess = useCallback(() => {
		setIsEditing(false);
		if (model.id) {
			refetchModel({ id: model.id });
		}
	}, [model.id, refetchModel]);

	const onArchiveSuccess = useCallback(() => {
		if (model.id) {
			refetchModel({ id: model.id });
		}
	}, [model.id, refetchModel]);

	const { isSubmitting, handleSubmit } = useKioskModelEdit({ onUpdateSuccess });

	const {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal: handleCloseArchiveModal,
		isOpenArchiveModal,
		pendingArchive,
	} = useKioskModelArchive({ onArchiveSuccess });

	const modelSchema = asLegacyModelSchema(kioskModelCreateSchema);

	const onFormSubmit = useCallback((data: KioskModelUpdateFormData) => {
		handleSubmit(data);
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(BASIC_INFO_FORM_ID);
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const onEditClick = useCallback(() => setIsEditing(true), []);
	const onCancelClick = useCallback(() => setIsEditing(false), []);

	const {
		handleDelete: handleDeleteKioskModel,
		handleOpenDeleteModal, handleCloseDeleteModal, isOpenDeleteModal,
	} = useKioskModelDelete({ onDeleteSuccess: () => navigate('../kiosk-models') });

	const onDeleteClick = useCallback(
		() => handleOpenDeleteModal(model),
		[model, handleOpenDeleteModal],
	);

	const onArchiveClick = useCallback(() => {
		handleOpenArchiveModal(model);
	}, [model, handleOpenArchiveModal]);

	const onRestoreClick = useCallback(() => {
		handleOpenRestoreModal(model);
	}, [model, handleOpenRestoreModal]);

	const confirmDelete = useCallback(() => {
		handleDeleteKioskModel();
		handleCloseDeleteModal();
	}, [handleDeleteKioskModel, handleCloseDeleteModal]);

	const actions = useMemo(
		() => buildBasicInfoActions(
			isEditing,
			isSubmitting,
			model,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			onArchiveClick,
			onRestoreClick,
			onDeleteClick,
		),
		[
			isEditing, isSubmitting, model, translate,
			onEditClick, onSaveClick, onCancelClick, onArchiveClick, onRestoreClick, onDeleteClick,
		],
	);

	useRegisterKioskModelDetailTab('basicInfo', actions);

	return {
		formId: BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		onFormSubmit,
		closeDeleteModal: handleCloseDeleteModal,
		confirmDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
	};
}
