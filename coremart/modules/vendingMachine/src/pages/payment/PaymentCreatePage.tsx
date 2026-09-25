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
import { PaymentDetailFormFields } from '../../features/payment/components/PaymentDetail/PaymentDetailFormFields';
import { PaymentCreateFormData, usePaymentCreate } from '../../features/payment/hooks/usePaymentCreate';
import { paymentSchema } from '../../features/payment/schemas';


const FORM_ID = 'payment-create-form';

const defaultFormValues: Partial<PaymentCreateFormData> = {
	method: '',
	name: '',
	isArchived: false,
};

export const PaymentCreatePage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const schema = asLegacyModelSchema(paymentSchema);
	const { isSubmitting, handleCancel, handleSubmit } = usePaymentCreate();
	const { breadcrumbs, actions } = usePaymentCreatePageConfig({
		handleCancel,
		isSubmitting,
	});

	return (
		<PageContainer
			documentTitle={translate('payment.title_create')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
		>
			<Stack gap='xs' p={6}>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='create'
						modelSchema={schema}
						modelValue={defaultFormValues}
						modelLoading={isSubmitting}
					>
						{({ handleSubmit: formHandleSubmit }) => (
							<>
								<form
									id={FORM_ID}
									onSubmit={formHandleSubmit((data) => handleSubmit(data as PaymentCreateFormData))}
									noValidate
									style={{ display: 'contents' }}
								/>
								<PaymentDetailFormFields mode='create' />
							</>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};


interface UsePaymentCreatePageConfigProps {
	handleCancel: () => void;
	isSubmitting: boolean;
}

function usePaymentCreatePageConfig({
	handleCancel,
	isSubmitting,
}: UsePaymentCreatePageConfigProps) {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');

	const breadcrumbs = useMemo(() => [
		{ title: translate('title'), href: '../overview' },
		{ title: translate('payment.title'), href: '../payment' },
		{ title: translate('payment.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('action.back'),
			onClick: () => navigate('../payment'),
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

	return { breadcrumbs, actions };
}
