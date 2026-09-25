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
import { KIOSK_TYPES, KioskModelCreateFormData, KioskModelFormFields, useKioskModelCreate } from '../../features/kioskModels';
import { kioskModelCreateSchema } from '../../features/kioskModels/schemas';


const FORM_ID = 'kiosk-model-create-form';

const defaultFormValues: Partial<KioskModelCreateFormData> = {
	shelvesNumber: 6,
	goodsCollectorType: KIOSK_TYPES.NON_ELEVATOR,
};

export const KioskModelCreatePage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');

	const schema = asLegacyModelSchema(kioskModelCreateSchema);
	const { isSubmitting, handleCancel, handleSubmit } = useKioskModelCreate();
	const { breadcrumbs, actions } = useKioskModelCreatePageConfig({
		handleCancel,
		isSubmitting,
	});

	return (
		<PageContainer
			documentTitle={translate('kiosk_models.title_create')}
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
								<KioskModelFormFields key='kiosk-model-form-fields' mode='create' />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};


interface UseKioskModelCreatePageConfigProps {
	handleCancel: () => void;
	isSubmitting: boolean;
}

function useKioskModelCreatePageConfig({
	handleCancel,
	isSubmitting,
}: UseKioskModelCreatePageConfigProps) {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('kiosk_models.title'), href: '../kiosk-models' },
		{ title: translate('kiosk_models.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('action.back'),
			onClick: () => navigate('../kiosk-models'),
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

	return {
		breadcrumbs,
		actions,
	};
}