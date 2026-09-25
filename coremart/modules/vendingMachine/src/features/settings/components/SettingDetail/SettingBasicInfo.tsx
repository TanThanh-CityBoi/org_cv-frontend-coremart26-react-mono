import { Box, Divider, Stack, Text } from '@mantine/core';
import { ConfirmModal, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { SettingConfigSection } from './SettingConfigSection';
import { Setting } from '../../types';
import {
	settingConfigToRows,
	settingRowsToConfig,
	type SettingConfigRow,
} from '../../utils/settingConfigRows';
import { SettingFormFields } from '../SettingFormFields/SettingFormFields';

import type { SettingFormProps } from './hooks/types';
import type { SettingCreateFormData } from '../../hooks/useSettingCreate';


export interface SettingBasicInfoProps {
	setting: Setting;
	formProps: SettingFormProps;
}

const SettingBasicInfoAuditDates: React.FC<{ setting: Setting }> = ({ setting }) => {
	const { t: translate } = useTranslation('vending_machine');
	return (
		<React.Fragment>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('settings.fields.created_at')}
				</Text>
				<Text size='sm'>{new Date(setting.createdAt).toLocaleString()}</Text>
			</Box>
			{setting.updatedAt && (
				<Box mt='xs'>
					<Text size='sm' c='dimmed' mb={3}>
						{translate('settings.fields.updated_at')}
					</Text>
					<Text size='sm'>{new Date(setting.updatedAt).toLocaleString()}</Text>
				</Box>
			)}
		</React.Fragment>
	);
};

export const SettingBasicInfo: React.FC<SettingBasicInfoProps> = ({ setting, formProps }) => {
	const { t } = useTranslation('vending_machine');
	const {
		formId, isEditing, isSubmitting, modelSchema, modelValue, onFormSubmit,
		closeDeleteModal, confirmDelete, isOpenDeleteModal,
	} = formProps;

	const [configRows, setConfigRows] = useState<SettingConfigRow[]>([]);

	useLayoutEffect(() => {
		if (isEditing) {
			setConfigRows(settingConfigToRows(setting.config));
		}
	}, [isEditing, setting.id, setting.etag]);

	useLayoutEffect(() => {
		if (!isEditing) {
			setConfigRows(settingConfigToRows(setting.config));
		}
	}, [isEditing, setting.id, setting.etag, setting.config]);

	const handleMergedSubmit = useCallback(
		(data: SettingCreateFormData) => {
			onFormSubmit({ ...data, config: settingRowsToConfig(configRows) });
		},
		[onFormSubmit, configRows],
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
										onSubmit={handleSubmit(handleMergedSubmit)}
										noValidate
										style={{ display: 'contents' }}
									/>
								)}
								<SettingFormFields mode={isEditing ? 'edit' : 'view'} />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<Divider my={4} />

				<SettingConfigSection
					mode={isEditing ? 'edit' : 'view'}
					configRows={configRows}
					onConfigRowsChange={setConfigRows}
				/>

				<SettingBasicInfoAuditDates setting={setting} />
			</Stack>

			<ConfirmModal
				title={t('messages.delete.confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={<Trans
					i18nKey='settings.messages.delete_confirm'
					values={{ name: setting?.name || '' }}
					components={{ strong: <strong /> }}
				/>}
				confirmLabel={t('action.delete')}
				confirmColor='red'
			/>
		</React.Fragment>
	);
};
