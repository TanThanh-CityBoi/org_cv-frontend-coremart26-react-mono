/* eslint-disable max-lines-per-function */
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
import { eventCrudService } from '../../../eventService';
import { useEventArchive } from '../../../hooks/useEventArchive';
import { useEventDelete } from '../../../hooks/useEventDelete';
import { EventUpdateFormData, useEventEdit } from '../../../hooks/useEventEdit';
import { eventCrudSchema } from '../../../schemas';
import { Event } from '../../../types';
import {
	useRegisterEventDetailTab,
} from '../eventDetailTabControl';


export const BASIC_EVENT_INFO_FORM_ID = 'event-basic-info-form';

export type EventBasicInfoFormData = Pick<
	Event,
	| 'id'
	| 'etag'
	| 'code'
	| 'name'
	| 'description'
	| 'startTime'
	| 'endTime'
	| 'dailyStartTime'
	| 'dailyEndTime'
	| 'isAllDay'
	| 'shoppingScreenPlaylistRef'
	| 'waitingScreenPlaylistRef'
	| 'themeRef'
	| 'gameRef'
>;

function buildBasicInfoActions(
	isEditing: boolean,
	isSubmitting: boolean,
	ev: Event,
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

	const archived = Boolean(ev.isArchived);
	const archiveAction = archived
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

export function useEventBasicInfoTab({ event }: { event: Event }) {
	const { t: translate } = useTranslation('vending_machine');
	const [isEditing, setIsEditing] = useState(false);
	const [formResetNonce, setFormResetNonce] = useState(0);
	const { dispatchMethod: refetchEvent } = useServiceLayer(eventCrudService.getById);
	const navigate = useNavigate();

	const onArchiveSuccess = useCallback(() => {
		if (event.id) {
			refetchEvent({ id: event.id });
		}
	}, [event.id, refetchEvent]);

	const { isSubmitting, handleSubmit } = useEventEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (event.id) {
				refetchEvent({ id: event.id });
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
	} = useEventArchive({ onSuccess: onArchiveSuccess });

	const modelSchema = asLegacyModelSchema(eventCrudSchema);

	const onFormSubmit = useCallback((data: EventBasicInfoFormData) => {
		handleSubmit(data as EventUpdateFormData);
	}, [handleSubmit]);

	const onSaveClick = useCallback(() => {
		const el = document.getElementById(BASIC_EVENT_INFO_FORM_ID);
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
		navigate('../events');
	}, [navigate]);

	const {
		isOpenDeleteModal,
		openDeleteModal,
		closeDeleteModal,
		handleDelete,
	} = useEventDelete({ onSuccess: onDeleteSuccess });

	const onArchiveClick = useCallback(() => {
		handleOpenArchiveModal(event);
	}, [event, handleOpenArchiveModal]);

	const onRestoreClick = useCallback(() => {
		handleOpenRestoreModal(event);
	}, [event, handleOpenRestoreModal]);

	const onDeleteClick = useCallback(() => openDeleteModal(event), [event, openDeleteModal]);

	const actions = useMemo(
		() => buildBasicInfoActions(
			isEditing,
			isSubmitting,
			event,
			translate,
			onEditClick,
			onSaveClick,
			onCancelClick,
			onArchiveClick,
			onRestoreClick,
			onDeleteClick,
		),
		[
			isEditing, isSubmitting, event, translate,
			onEditClick, onSaveClick, onCancelClick, onArchiveClick, onRestoreClick, onDeleteClick,
		],
	);

	const formValues = useMemo(
		() => ({ ...event }),
		[event, formResetNonce],
	);

	useRegisterEventDetailTab('basicInfo', actions);

	return {
		formId: BASIC_EVENT_INFO_FORM_ID,
		isEditing,
		isSubmitting,
		modelSchema,
		formValues,
		onFormSubmit,
		closeDeleteModal,
		confirmDelete: handleDelete,
		isOpenDeleteModal,
		isOpenArchiveModal,
		pendingArchive,
		handleConfirmArchive,
		handleCloseArchiveModal,
	};
}
