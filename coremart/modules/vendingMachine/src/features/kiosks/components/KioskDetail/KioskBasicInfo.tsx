import { Divider, Stack } from '@mantine/core';
import { AdhocFormProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useLocalize } from '@nikkierp/ui/i18n';
import React from 'react';

import { ArchiveKioskModal, DeleteKioskModal  } from '../..';
import { AuditDate } from '../../../../components/AuditDate';
import { KioskStateDetailFields } from '../../../../components/KioskState';
import { Kiosk } from '../../types';
import { KioskFormFields } from '../KioskFormFields/KioskFormFields';
import { useBasicInfoTab } from './hooks/useBasicInfoTab';


export interface KioskBasicInfoProps {
	kiosk: Kiosk;
}

export const KioskBasicInfo: React.FC<KioskBasicInfoProps> = ({ kiosk }) => {
	const {
		formId, isEditing, isSubmitting, modelSchema, formValues, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal,
		isOpenArchiveModal, pendingArchive, handleConfirmArchive, handleCloseArchiveModal,
	} = useBasicInfoTab({ kiosk });
	const localize = useLocalize('vending_machine');

	return (
		<React.Fragment>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<AdhocFormProvider
						key={`${kiosk.id}-${kiosk.etag}-basic-info`}
						formVariant='update'
						modelSchema={modelSchema}
						localize={localize}
						modelValue={formValues}
						modelLoading={isEditing && isSubmitting}
					>
						{({ handleSubmit }) => (
							<>
								<form
									id={formId}
									onSubmit={isEditing ? handleSubmit(onFormSubmit) : undefined}
									noValidate
									style={{ display: 'contents' }}
								>
									<KioskFormFields mode={isEditing ? 'edit' : 'view'} kiosk={kiosk} isSubmitting={isSubmitting} />
								</form>
							</>
						)}
					</AdhocFormProvider>
				</FormStyleProvider>

				<Divider my={'xs'} />

				<KioskStateDetailFields kiosk={kiosk} />

				<AuditDate date={kiosk?.createdAt} />
			</Stack>

			<DeleteKioskModal
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				name={kiosk.name || ''}
			/>

			<ArchiveKioskModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				type={pendingArchive?.targetArchived ? 'archive' : 'restore'}
				name={pendingArchive?.kiosk?.name ?? ''}
			/>

		</React.Fragment>
	);
};
