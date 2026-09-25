import { Box, Divider, Stack, Text } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';

import { KioskSetting } from '../../types';
import { ArchiveKioskSettingModal, DeleteKioskSettingModal } from '../KioskSettingConfirmModals';
import { KioskSettingFormFields } from '../KioskSettingFormFields';
import { useKioskSettingBasicInfoTab } from './hooks/useKioskSettingBasicInfoTab';


export interface KioskSettingDetailBasicInfoProps {
	setting: KioskSetting;
}

const KioskSettingBasicInfoAuditDates: React.FC<{ setting: KioskSetting }> = ({ setting }) => {
	const { t: translate } = useTranslation();
	return (
		<React.Fragment>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('coremart.vendingMachine.kioskSettings.fields.createdAt')}
				</Text>
				<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
			</Box>
		</React.Fragment>
	);
};

export const KioskSettingDetailBasicInfo: React.FC<KioskSettingDetailBasicInfoProps> = ({ setting }) => {
	const {
		formId,
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
	} = useKioskSettingBasicInfoTab({ setting });

	const { t: translate } = useTranslation();
	const archiveBadge = React.useMemo(
		() => <ArchivedStatusBadge isArchived={!!setting.isArchived} />,
		[setting.isArchived],
	);

	return (
		<React.Fragment>
			<Stack gap='xs'>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						key={`${setting.id}-${setting.etag}-basic-info`}
						formVariant='update'
						modelSchema={modelSchema}
						modelValue={modelValue}
						modelLoading={isEditing && isSubmitting}
					>
						{({ handleSubmit }) => (
							<>
								{isEditing && (
									<form
										id={formId}
										onSubmit={handleSubmit(onFormSubmit)}
										noValidate
										style={{ display: 'contents' }}
									/>
								)}
								<KioskSettingFormFields mode={isEditing ? 'edit' : 'view'} />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<Divider my={3} />
				<Box>
					<Text size='sm' c='dimmed' mb={3}>
						{translate('coremart.vendingMachine.kioskSettings.fields.status')}
					</Text>
					{archiveBadge}
				</Box>

				<KioskSettingBasicInfoAuditDates setting={setting} />
			</Stack>

			<DeleteKioskSettingModal
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				name={setting.name || ''}
			/>

			<ArchiveKioskSettingModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				type={(pendingArchive?.targetArchived ?? true) ? 'archive' : 'restore'}
				name={pendingArchive?.setting.name ?? ''}
			/>
		</React.Fragment>
	);
};
