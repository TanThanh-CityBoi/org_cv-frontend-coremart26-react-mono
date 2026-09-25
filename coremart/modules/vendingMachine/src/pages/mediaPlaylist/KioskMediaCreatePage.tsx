import { Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel } from '../../components';
import { ControlPanelProps } from '../../components/ControlPanel/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { useKioskMediaCreate } from '../../features/mediaPlaylist';
import { KioskMediaFileSelector } from '../../features/mediaPlaylist/components/KioskMediaFileSelector/KioskMediaFileSelector';


const FORM_ID = 'kiosk-media-create-form';

function formatCreateError(err: unknown): string {
	if (err instanceof Error) return err.message;
	if (typeof err === 'object' && err !== null) {
		const detail = err as { code?: string, details?: unknown, message?: string };
		if (typeof detail.message === 'string' && detail.message) return detail.message;
		if (detail.details !== undefined) return JSON.stringify(detail.details);
		if (typeof detail.code === 'string') return detail.code;
	}
	try {
		return JSON.stringify(err);
	}
	catch {
		return String(err);
	}
}

interface UseKioskMediaCreatePageConfigProps {
	isSubmitting: boolean;
}

function useKioskMediaCreatePageConfig({
	isSubmitting,
}: UseKioskMediaCreatePageConfigProps) {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('title'), href: '../../overview' },
			{ title: translate('kiosk_media.title'), href: '../media-playlist/gallery' },
			{ title: translate('kiosk_media.create.title'), href: '#' },
		],
		[translate],
	);

	const actions = useMemo<ControlPanelProps['actions']>(
		() => [
			{
				label: translate('action.back'),
				onClick: () => navigate('../media-playlist/gallery'),
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
		],
		[translate, navigate, isSubmitting],
	);

	return { breadcrumbs, actions };
}

export const KioskMediaCreatePage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();
	const { isSubmitting, create } = useKioskMediaCreate();

	const form = useForm({
		initialValues: { name: '', file: null as File | null },
		validate: {
			name: (v) =>
				!v?.trim() ? translate('kiosk_media.create.validation.name') : null,
			file: (v) =>
				!v ? translate('kiosk_media.create.validation.file') : null,
		},
	});

	const { breadcrumbs, actions } = useKioskMediaCreatePageConfig({ isSubmitting });

	const handleSubmit = form.onSubmit(async (values) => {
		if (!values.file) return;
		try {
			await create({ name: values.name, file: values.file });
			const successTitle = translate('kiosk_media.messages.create_success');
			notifications.show({
				color: 'green',
				title: successTitle,
				message: successTitle,
			});
			navigate('../media-playlist/gallery');
		}
		catch (err) {
			const message = formatCreateError(err);
			notifications.show({
				color: 'red',
				title: translate('messages.error'),
				message: translate('kiosk_media.messages.create_failed', { message }),
			});
		}
	});

	return (
		<PageContainer
			documentTitle={translate('kiosk_media.create.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='control-panel' actions={actions} />]}
		>
			<Stack gap='xs' p={6} maw={560}>
				<form id={FORM_ID} onSubmit={handleSubmit} noValidate>
					<Stack gap='md'>
						<TextInput
							label={translate('kiosk_media.fields.name')}
							placeholder={translate('kiosk_media.create.name_placeholder')}
							{...form.getInputProps('name')}
						/>
						<KioskMediaFileSelector
							label={translate('kiosk_media.create.file_label')}
							file={form.values.file}
							onFileChange={(next: File | null) => {
								form.setFieldValue('file', next);
								form.clearFieldError('file');
							}}
							error={typeof form.errors.file === 'string' ? form.errors.file : undefined}
						/>
					</Stack>
				</form>
			</Stack>
		</PageContainer>
	);
};
