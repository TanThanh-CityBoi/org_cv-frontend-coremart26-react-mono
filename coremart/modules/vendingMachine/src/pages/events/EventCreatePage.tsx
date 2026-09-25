import { Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from '@/components';
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { EventFormFields, useEventCreate } from '@/features/events';
import { eventCrudSchema } from '@/features/events/schemas';


const FORM_ID = 'event-create-form';

const defaultFormValues = {
	startTime: dayjs().startOf('day').toDate(),
	endTime: dayjs().endOf('day').toDate(),
	dailyStartTime: '08:00',
	dailyEndTime: '22:00',
	isAllDay: false,
	shoppingScreenPlaylistRef: null,
	waitingScreenPlaylistRef: null,
	themeRef: null,
	gameRef: null,
};

function useEventCreatePageConfig({ handleCancel, isSubmitting }: {
	handleCancel: () => void;
	isSubmitting: boolean;
}): { breadcrumbs: BreadcrumbItem[]; actions: ControlPanelProps['actions'] } {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	const breadcrumbs = useMemo(() => [
		{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
		{ title: translate('coremart.vendingMachine.menu.events'), href: '../events' },
		{ title: translate('coremart.vendingMachine.events.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../events'),
			leftSection: <IconArrowLeft size={16} />,
			variant: 'outline' as const,
		},
		{
			label: translate('nikki.general.actions.create'),
			leftSection: <IconDeviceFloppy size={16} />,
			variant: 'filled' as const,
			type: 'submit' as const,
			form: FORM_ID,
			loading: isSubmitting,
		},
		{
			label: translate('nikki.general.actions.cancel'),
			leftSection: <IconX size={16} />,
			onClick: handleCancel,
			variant: 'outline' as const,
			disabled: isSubmitting,
		},
	], [translate, navigate, handleCancel, isSubmitting]);

	return { breadcrumbs, actions };
}

export const EventCreatePage: React.FC = () => {
	const { t: translate } = useTranslation();
	const schema = eventCrudSchema as ModelSchema;

	const { isSubmitting, handleCancel, handleSubmit } = useEventCreate();
	const { breadcrumbs, actions } = useEventCreatePageConfig({ handleCancel, isSubmitting });

	return (
		<PageContainer
			documentTitle={translate('coremart.vendingMachine.events.title_create')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='event-create-actions' actions={actions} />]}
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
							<form
								id={FORM_ID}
								onSubmit={formHandleSubmit((data) => handleSubmit(data))}
								noValidate
								style={{ display: 'contents' }}
							>
								<EventFormFields key='event-form-fields' mode='create' isSubmitting={isSubmitting} />
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};
