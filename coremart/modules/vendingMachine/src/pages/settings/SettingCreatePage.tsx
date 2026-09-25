import { Divider, Stack } from '@mantine/core';
import { FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from '@/components';
import { BreadcrumbItem } from '@/components/BreadCrumbs';
import { ControlPanelProps } from '@/components/ControlPanel/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import {
	SettingCreateFormData,
	SettingFormFields,
	settingSchema,
	useSettingCreate,
} from '@/features/settings';
import { SettingConfigSection } from '@/features/settings/components/SettingDetail/SettingConfigSection';
import {
	settingRowsToConfig,
	type SettingConfigRow,
} from '@/features/settings/utils/settingConfigRows';


const FORM_ID = 'setting-create-form';

const defaultFormValues: Partial<SettingCreateFormData> = {};

interface UseSettingCreatePageConfigProps {
	handleCancel: () => void;
	isSubmitting: boolean;
}

interface UseSettingCreatePageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: ControlPanelProps['actions'];
}

function useSettingCreatePageConfig({
	handleCancel,
	isSubmitting,
}: UseSettingCreatePageConfigProps): UseSettingCreatePageConfigReturn {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();

	const breadcrumbs = useMemo<BreadcrumbItem[]>(() => [
		{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
		{ title: translate('coremart.vendingMachine.settings.title'), href: '../settings' },
		{ title: translate('coremart.vendingMachine.settings.title_create'), href: '#' },
	], [translate]);

	const actions = useMemo<ControlPanelProps['actions']>(() => [
		{
			label: translate('nikki.general.actions.back'),
			onClick: () => navigate('../settings'),
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
			disabled: isSubmitting,
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

export const SettingCreatePage: React.FC = () => {
	const { t: translate } = useTranslation();
	const schema = settingSchema as ModelSchema;
	const { isSubmitting, handleCancel, handleSubmit } = useSettingCreate();
	const { breadcrumbs, actions } = useSettingCreatePageConfig({ handleCancel, isSubmitting });

	const [configRows, setConfigRows] = useState<SettingConfigRow[]>([]);

	const handleFormSubmit = useCallback(
		(data: SettingCreateFormData) => {
			handleSubmit({ ...data, config: settingRowsToConfig(configRows) });
		},
		[handleSubmit, configRows],
	);

	return (
		<PageContainer
			documentTitle={translate('coremart.vendingMachine.settings.title_create')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
		>
			<Stack gap='xs'>
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
								onSubmit={formHandleSubmit(handleFormSubmit)}
								noValidate
								style={{ display: 'contents' }}
							>
								<SettingFormFields key='setting-form-fields' mode='create' />
							</form>
						)}
					</FormFieldProvider>
				</FormStyleProvider>

				<Divider my={4} />

				<SettingConfigSection
					mode='create'
					configRows={configRows}
					onConfigRowsChange={setConfigRows}
				/>
			</Stack>
		</PageContainer>
	);
};
