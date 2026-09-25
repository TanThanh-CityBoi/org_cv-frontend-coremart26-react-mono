import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { eventCrudService } from '../eventService';

import type { Event } from '../types';


export const useEventDelete = ({ onSuccess = () => {} }: { onSuccess?: () => void } = {}) => {
	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [eventToDelete, setEventToDelete] = React.useState<Event | null>(null);

	const { dispatchMethod, result } = useServiceLayer(eventCrudService.delete);

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
		dispatchMethod({ id: eventToDelete.id });
	}, [dispatchMethod, eventToDelete]);

	useMutationOutcome(result, {
		successKey: () => 'events.messages.delete_success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { closeDeleteModal(); onSuccess(); },
	});

	return {
		handleDelete,
		openDeleteModal,
		closeDeleteModal,
		isOpenDeleteModal,
		eventToDelete,
	};
};
