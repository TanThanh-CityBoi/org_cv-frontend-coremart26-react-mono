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
import { useNavigate } from 'react-router';

import { eventActions, VendingMachineDispatch } from '@/appState';
import { ControlPanelProps } from '@/components/ControlPanel';
import {
	useRegisterEventDetailTab,
} from '@/features/events/components/EventDetail/eventDetailTabControl';
import { useEventArchive } from '@/features/events/hooks/useEventArchive';
import { useEventDelete } from '@/features/events/hooks/useEventDelete';
import { EventUpdateFormData, useEventEdit } from '@/features/events/hooks/useEventEdit';
import { eventCrudSchema } from '@/features/events/schemas';
import { Event } from '@/features/events/types';


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

	const archived = Boolean(ev.isArchived);
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

export function useEventBasicInfoTab({ event }: { event: Event }) {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [formResetNonce, setFormResetNonce] = useState(0);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const navigate = useNavigate();

	const onArchiveSuccess = useCallback(() => {
		if (event.id) {
			dispatch(eventActions.getEvent(event.id));
		}
	}, [event.id, dispatch]);

	const { isSubmitting, handleSubmit } = useEventEdit({
		onUpdateSuccess: () => {
			setIsEditing(false);
			if (event.id) {
				dispatch(eventActions.getEvent(event.id));
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

	const modelSchema = eventCrudSchema as ModelSchema;

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
