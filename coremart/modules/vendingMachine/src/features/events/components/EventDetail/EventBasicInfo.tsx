import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuditDate } from '../../../../components';
import { Event } from '../../types';
import { ArchiveEventModal, DeleteEventModal } from '../EventConfirmModals';
import { EventFormFields } from '../EventFormFields';
import { useEventBasicInfoTab } from './hooks/useEventBasicInfoTab';


export interface EventBasicInfoProps {
	event: Event;
}

export const EventBasicInfo: React.FC<EventBasicInfoProps> = ({ event }) => {
	const { t: translate } = useTranslation('vending_machine');
	const {
		formId, isEditing, isSubmitting, modelSchema, formValues, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal,
		isOpenArchiveModal, pendingArchive, handleConfirmArchive, handleCloseArchiveModal,
	} = useEventBasicInfoTab({ event });

	return (
		<>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${event.id}-${event.etag}-basic-info`}
						formVariant='update'
						modelSchema={modelSchema}
						modelValue={formValues}
						modelLoading={isEditing && isSubmitting}
					>
						{({ handleSubmit }) => (
							<form
								id={formId}
								onSubmit={isEditing ? handleSubmit(onFormSubmit) : undefined}
								noValidate
								style={{ display: 'contents' }}
							>
								<EventFormFields mode={isEditing ? 'edit' : 'view'} isSubmitting={isSubmitting} />
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<AuditDate
					date={event.createdAt}
					label={translate('events.fields.created_at')}
				/>
			</Stack>

			<DeleteEventModal
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				name={event.name || ''}
			/>

			<ArchiveEventModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				type={(pendingArchive?.targetArchived ?? true) ? 'archive' : 'restore'}
				name={pendingArchive?.event.name ?? ''}
			/>
		</>
	);
};
