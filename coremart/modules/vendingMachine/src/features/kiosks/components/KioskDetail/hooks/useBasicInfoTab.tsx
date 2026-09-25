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


import { KioskDetailTabs } from './types';
import { ControlPanelProps } from '../../../../../components/ControlPanel';
import { useKioskArchive } from '../../../hooks/useKioskArchive';
import { useKioskDelete } from '../../../hooks/useKioskDelete';
import { KioskUpdateFormData, useKioskEdit } from '../../../hooks/useKioskEdit';
import { kioskCrudService } from '../../../kioskService';
import { kioskCreateSchema } from '../../../schemas';
import { Kiosk } from '../../../types';
import { useRegisterKioskDetailTab } from '../kioskDetailTabControl';



export type KioskBasicInfoFormData = Pick<
	KioskUpdateFormData,
	| 'id'
	| 'etag'
	| 'code'
	| 'name'
	| 'isArchived'
	| 'mode'
	| 'uiMode'
	| 'locationAddress'
	| 'latitude'
	| 'longitude'
	| 'modelRef'
	| 'paymentRefs'
>;

export const BASIC_INFO_FORM_ID = 'kiosk-basic-info-form';

function buildBasicInfoActions(
	isEditing: boolean,
	isSubmitting: boolean,
	kiosk: Kiosk,
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

	const archiveAction = kiosk.isArchived
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
	kiosk: Kiosk,
	onOpenDeleteKiosk?: (kiosk: Kiosk) => void,
};

export type UseBasicInfoTabReturn = {
	formId: string,
	isEditing: boolean,
	isSubmitting: boolean,
	modelSchema: ModelSchema,
	formValues: KioskBasicInfoFormData,
	onFormSubmit: (data: KioskBasicInfoFormData) => void,
	openDeleteModal: () => void,
	closeDeleteModal: () => void,
	confirmDelete: () => void,
	isOpenDeleteModal: boolean,
	isOpenArchiveModal: boolean,
	pendingArchive: { kiosk: Kiosk, targetArchived: boolean } | null,
	handleConfirmArchive: () => void,
	handleCloseArchiveModal: () => void,
};

export function useBasicInfoTab({ kiosk }: UseBasicInfoTabArgs): UseBasicInfoTabReturn {
	const { t: translate } = useTranslation('vending_machine');
	const [isEditing, setIsEditing] = useState(false);
	const [formResetNonce, setFormResetNonce] = useState(0);
	const { dispatchMethod: reloadKiosk } = useServiceLayer(kioskCrudService.getById);
	const navigate = useNavigate();

	const onArchiveSuccess = useCallback(() => {
		if (kiosk.id) {
			reloadKiosk({ id: kiosk.id });
		}
	}, [kiosk.id, reloadKiosk]);

	const { isSubmitting, handleSubmit } = useKioskEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (kiosk.id) {
				reloadKiosk({ id: kiosk.id });
			}
		},
	});

	const {
		handleConfirmArchive,
		handleOpenArchiveModal,
		handleOpenRestoreModal,
		handleCloseModal: handleCloseArchiveModal,
		isOpenArchiveModal,
		pendingArchive,
	} = useKioskArchive({ onSuccess: onArchiveSuccess });

	const modelSchema = kioskCreateSchema;

	const onFormSubmit = useCallback((data: KioskBasicInfoFormData) => {
		handleSubmit(data);
	}, [handleSubmit, kiosk]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(BASIC_INFO_FORM_ID);
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

	const onDeleteSuccess = useCallback(() => {
		navigate('../kiosks');
	}, [navigate]);

	const {
		isOpenDeleteModal,
		openDeleteModal,
		closeDeleteModal,
		handleDelete,
	} = useKioskDelete({ onSuccess: onDeleteSuccess });

	const onDeleteClick = useCallback(() => openDeleteModal(kiosk), [kiosk, openDeleteModal]);

	const onArchiveClick = useCallback(() => {
		handleOpenArchiveModal(kiosk);
	}, [kiosk, handleOpenArchiveModal]);

	const onRestoreClick = useCallback(() => {
		handleOpenRestoreModal(kiosk);
	}, [kiosk, handleOpenRestoreModal]);

	const actions = useMemo(
		() => buildBasicInfoActions(
			isEditing,
			isSubmitting,
			kiosk,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			onArchiveClick,
			onRestoreClick,
			onDeleteClick,
		),
		[
			isEditing, isSubmitting, kiosk, translate,
			onEditClick, onSaveClick, onCancelClick, onArchiveClick, onRestoreClick, onDeleteClick,
		],
	);

	const formValues = useMemo(() => {
		return {
			...kiosk,
			paymentRefs: kiosk.payments?.map((payment) => payment.id),
		};
	}, [kiosk, formResetNonce]);

	useRegisterKioskDetailTab(KioskDetailTabs.BASIC_INFO, actions);

	return {
		formId: BASIC_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		formValues,
		onFormSubmit,
		openDeleteModal: () => openDeleteModal(kiosk),
		closeDeleteModal,
		confirmDelete: handleDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
	};
}
