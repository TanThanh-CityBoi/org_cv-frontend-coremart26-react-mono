import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { asLegacyModelSchema } from '../../common/helpers';
import { ControlPanel } from '../../components';
import { ControlPanelProps } from '../../components/ControlPanel/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { KioskSettingFormFields, kioskSettingCreateSchema, useKioskSettingCreate } from '../../features/kioskSettings';


const FORM_ID = 'kiosk-setting-create-form';

const defaultFormValues = {};

export const KioskSettingCreatePage: React.FC = () => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');
	const schema = asLegacyModelSchema(kioskSettingCreateSchema);
	const { isSubmitting, handleCancel, handleSubmit } = useKioskSettingCreate();

	React.useEffect(() => {
		document.title = translate('kiosk_settings.title_create');
	}, [translate]);

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('kiosk_settings.title'), href: '../kiosk-settings' },
		{ title: translate('kiosk_settings.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('action.back'),
			onClick: () => navigate('../kiosk-settings'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline' as const,
		},
		{
			label: translate('action.create'),
			leftSection: <IconDeviceFloppy size={16} />,
			variant: 'filled' as const,
			type: 'submit' as const,
			form: FORM_ID,
			loading: isSubmitting,
		},
		{
			label: translate('action.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			variant: 'outline' as const,
			disabled: isSubmitting,
		},
	], [translate, navigate, handleCancel, isSubmitting]);

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
		>
			<Stack gap='xs' p={6}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider formVariant='create' modelSchema={schema} modelValue={defaultFormValues} modelLoading={isSubmitting}>
						{({ handleSubmit: formHandleSubmit }) => (
							<>
								<form
									id={FORM_ID}
									onSubmit={formHandleSubmit((data) => handleSubmit(data))}
									noValidate
									style={{ display: 'contents' }}
								/>
								<KioskSettingFormFields key='kiosk-setting-form-fields' mode='create' />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};
