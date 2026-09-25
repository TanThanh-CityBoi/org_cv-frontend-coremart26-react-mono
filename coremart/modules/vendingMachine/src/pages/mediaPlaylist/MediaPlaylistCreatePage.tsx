/* eslint-disable max-lines-per-function */
import { Stack, TextInput } from '@mantine/core';
import { useUIState } from '@nikkierp/shell/contexts';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { IconArrowLeft, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ControlPanel, type ControlPanelProps } from '../../components';
import { PageContainer } from '../../components/PageContainer';
import { mediaPlaylistCrudService } from '../../features/mediaPlaylist/mediaPlaylistCrudService';


export const MediaPlaylistCreatePage: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	const navigate = useNavigate();
	const { notification } = useUIState();
	const { dispatchMethod: createPlaylist } = useServiceLayer(mediaPlaylistCrudService.create);
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
					translate('media_playlist.messages.name_required'),
					translate('messages.error'),
				);
				return;
			}
			setIsSubmitting(true);
			try {
				// The thunk resolves to a `{ data, clientErrors }` envelope, not the record —
				// a 4xx *fulfils* with client errors rather than throwing, so check it here.
				const { data, clientErrors } = await createPlaylist({ name: trimmed }).unwrap();
				if (clientErrors.length > 0) {
					notification.showError(clientErrors[0].message, translate('messages.error'));
					return;
				}
				notification.showInfo(
					translate('media_playlist.messages.create_success'),
					translate('messages.success'),
				);
				navigate(`../media-playlist/playlists/${data.id}`);
			}
			catch (err) {
				const message =
					err instanceof Error ? err.message : translate('errors.createFailed');
				notification.showError(message, translate('messages.error'));
			}
			finally {
				setIsSubmitting(false);
			}
		},
		[createPlaylist, name, navigate, notification, translate],
	);

	const breadcrumbs = useMemo(
		() => [
			{ title: translate('title'), href: '../overview' },
			{ title: translate('media_playlist.title'), href: '../media-playlist/playlists' },
			{ title: translate('media_playlist.create.title'), href: '#' },
		],
		[translate],
	);

	const actions = useMemo<ControlPanelProps['actions']>(
		() => [
			{
				label: translate('action.back'),
				onClick: handleCancel,
				leftSection: <IconArrowLeft size={16} />,
				variant: 'outline',
			},
			{
				label: translate('action.create'),
				leftSection: <IconDeviceFloppy size={16} />,
				variant: 'filled',
				type: 'submit',
				form: 'media-playlist-create-form',
				loading: isSubmitting,
			},
			{
				label: translate('action.cancel'),
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
			documentTitle={translate('media_playlist.create.title')}
			breadcrumbs={breadcrumbs}
			sections={[<ControlPanel key='media-playlist-create-actions' actions={actions} />]}
		>
			<form id='media-playlist-create-form' onSubmit={handleSubmit} noValidate>
				<Stack gap='xs' p={6} maw={560}>
					<TextInput
						label={translate('media_playlist.fields.name')}
						placeholder={translate('media_playlist.fields.name')}
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
