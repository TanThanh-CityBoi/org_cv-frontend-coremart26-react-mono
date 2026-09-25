import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	eventActions,
	selectDeleteEvent,
	VendingMachineDispatch,
} from '@/appState';

import type { Event } from '@/features/events/types';

export const useEventDelete = ({ onSuccess = () => {} }: { onSuccess?: () => void } = {}) => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [eventToDelete, setEventToDelete] = React.useState<Event | null>(null);

	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteEvent);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const deleteRequestIdRef = React.useRef<string | null>(null);

	const openDeleteModal = React.useCallback((evt: Event) => {
		setEventToDelete(evt);
		setIsOpenDeleteModal(true);
	}, []);

	const closeDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setEventToDelete(null);
	}, []);

	const handleDelete = React.useCallback(() => {
		if (!eventToDelete) return;
		const action = dispatch(eventActions.deleteEvent({ id: eventToDelete.id }));
		deleteRequestIdRef.current = action.requestId;
	}, [dispatch, eventToDelete]);

	React.useEffect(() => {
		const requestId = deleteState.requestId;
		const matchesDispatch = requestId != null && requestId === deleteRequestIdRef.current;
		if (!matchesDispatch) return;

		if (deleteState.status === 'success') {
			deleteRequestIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.events.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(eventActions.resetDeleteEvent());
			closeDeleteModal();
			onSuccess?.();
		}
		if (deleteState.status === 'error') {
			deleteRequestIdRef.current = null;
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(eventActions.resetDeleteEvent());
		}
	}, [deleteState, dispatch, notification, translate, closeDeleteModal, onSuccess]);

	return {
		handleDelete,
		openDeleteModal,
		closeDeleteModal,
		isOpenDeleteModal,
		eventToDelete,
	};
};
