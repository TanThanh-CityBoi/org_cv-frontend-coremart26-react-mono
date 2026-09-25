import { Box, Image, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { normalizePlaylistObjectFit, type PlaylistMediaRow } from '../../types';


export type KioskMediaPreviewModalProps = {
	opened: boolean;
	onClose: () => void;
	media: PlaylistMediaRow;
};

export function KioskMediaPreviewModal({ opened, onClose, media }: KioskMediaPreviewModalProps) {
	const { t: translate } = useTranslation();
	const fit = normalizePlaylistObjectFit(media.objectFit);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={translate('coremart.vendingMachine.mediaPlaylist.media.preview_modal_title')}
			size='xl'
			centered
		>
			<Stack gap='sm' align='center'>
				<Box
					style={{
						maxHeight: '75vh',
						width: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'var(--mantine-color-gray-1)',
						borderRadius: 8,
						overflow: 'hidden',
					}}
				>
					{media.type === 'image' ? (
						<Image src={media.url} alt={media.name} fit={fit} mah='75vh' maw='100%' />
					) : (
						<video
							src={media.url}
							controls
							playsInline
							style={{
								maxHeight: '75vh',
								maxWidth: '100%',
								objectFit: fit,
								display: 'block',
							}}
						/>
					)}
				</Box>
				<Text size='sm' fw={500} ta='center'>
					{media.name}
				</Text>
			</Stack>
		</Modal>
	);
}
