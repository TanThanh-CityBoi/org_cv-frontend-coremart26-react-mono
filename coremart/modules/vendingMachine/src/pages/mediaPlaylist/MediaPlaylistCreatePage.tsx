/* eslint-disable max-lines-per-function */
import { Stack, TextInput } from '@mantine/core';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { mediaPlaylistActions, VendingMachineDispatch } from '@/appState';
import { ControlPanel, type ControlPanelProps } from '@/components';
import { PageContainer } from '@/components/PageContainer';


export const MediaPlaylistCreatePage: React.FC = () => {
	const { t: translate } = useTranslation();
	const navigate = useNavigate();
	const { notification } = useUIState();
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const [name, setName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCancel = useCallback(() => {
		navigate('../media-playlist/playlists');
	}, [navigate]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = name.trim();
			if (!trimmed) {
				notification.showError(
					translate('coremart.vendingMachine.mediaPlaylist.messages.name_required'),
					translate('nikki.general.messages.error'),
				);
				return;
			}
			setIsSubmitting(true);
			try {
				const created = await dispatch(
					mediaPlaylistActions.createMediaPlaylist({ name: trimmed }),
				).unwrap();
				notification.showInfo(
					translate('coremart.vendingMachine.mediaPlaylist.messages.create_success'),
					translate('nikki.general.messages.success'),
				);
				navigate(`../media-playlist/playlists/${created.id}`);
			}
			catch (err) {
				const message =
					err instanceof Error ? err.message : translate('nikki.general.errors.create_failed');
				notification.showError(message, translate('nikki.general.messages.error'));
			}
			finally {
				setIsSubmitting(false);
			}
		},
		[dispatch, name, navigate, notification, translate],
	);

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('coremart.vendingMachine.title'), href: '../overview' },
			{ title: translate('coremart.vendingMachine.mediaPlaylist.title'), href: '../media-playlist/playlists' },
			{ title: translate('coremart.vendingMachine.mediaPlaylist.create.title'), href: '#' },
		],
		[translate],
	);

	const actions = useMemo<ControlPanelProps['actions']>(
		() => [
			{
				label: translate('nikki.general.actions.back'),
				onClick: handleCancel,
				leftSection: <IconArrowLeft size={16} />,
				variant: 'outline',
			},
			{
				label: translate('nikki.general.actions.create'),
				leftSection: <IconDeviceFloppy size={16} />,
				variant: 'filled',
				type: 'submit',
				form: 'media-playlist-create-form',
				loading: isSubmitting,
			},
			{
				label: translate('nikki.general.actions.cancel'),
				leftSection: <IconX size={16} />,
				onClick: handleCancel,
				variant: 'outline',
				disabled: isSubmitting,
			},
		],
		[translate, handleCancel, isSubmitting],
	);

	return (
		<PageContainer
			documentTitle={translate('coremart.vendingMachine.mediaPlaylist.create.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='media-playlist-create-actions' actions={actions} />]}
		>
			<form id='media-playlist-create-form' onSubmit={handleSubmit} noValidate>
				<Stack gap='xs' p={6} maw={560}>
					<TextInput
						label={translate('coremart.vendingMachine.mediaPlaylist.fields.name')}
						placeholder={translate('coremart.vendingMachine.mediaPlaylist.fields.name')}
						value={name}
						onChange={(ev) => setName(ev.currentTarget.value)}
						required
						disabled={isSubmitting}
						autoFocus
					/>
				</Stack>
			</form>
		</PageContainer>
	);
};
