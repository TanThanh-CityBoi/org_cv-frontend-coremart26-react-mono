import { Box, Divider, Stack, Text } from '@mantine/core';
import { IconPhoto, IconVideo } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDateTime } from '../../../../common/helpers/format-time';
import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { PreviewDrawer } from '../../../../components/PreviewDrawer';
import { inferKioskGalleryMediaType, mapKioskMediaToGalleryMedia } from '../../kioskMediaService';
import { MediaPreview } from '../MediaPreview';
import { KioskMediaMutationFooter } from './KioskMediaMutationFooter';
import { KioskMediaPreviewModal } from './KioskMediaPreviewModal';

import type { KioskMedia, PlaylistMediaRow } from '../../types';



export interface KioskMediaDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	media: KioskMedia | undefined;
	baseApiUrl: string | undefined;
	isLoading?: boolean;
	onRequestDelete?: () => void;
	onRequestArchive?: () => void;
	onRequestRestore?: () => void;
}

function DetailField({ label, value }: { label: string, value: React.ReactNode }) {
	return (
		<Box>
			<Text size='sm' c='dimmed' mb={3}>
				{label}
			</Text>
			<Text size='sm' fw={500}>{value}</Text>
		</Box>
	);
}

function toPlaylistMediaRow(km: KioskMedia, baseApiUrl: string): PlaylistMediaRow {
	const gm = mapKioskMediaToGalleryMedia(km, baseApiUrl);
	return {
		id: gm.id,
		kioskMediaRef: gm.id,
		name: gm.name,
		type: gm.type,
		url: gm.url,
		thumbnailUrl: gm.thumbnailUrl,
		order: 0,
	};
}

// eslint-disable-next-line max-lines-per-function -- drawer layout branches + detail fields
export const KioskMediaDetailDrawer: React.FC<KioskMediaDetailDrawerProps> = ({
	opened,
	onClose,
	media,
	baseApiUrl,
	isLoading = false,
	onRequestDelete,
	onRequestArchive,
	onRequestRestore,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const [previewModalOpen, setPreviewModalOpen] = useState(false);
	const previewRow = media && baseApiUrl ? toPlaylistMediaRow(media, baseApiUrl) : null;

	useEffect(() => {
		setPreviewModalOpen(false);
	}, [media?.id]);

	return (
		<PreviewDrawer
			opened={opened}
			onClose={onClose}
			header={{
				title: media?.name,
				subtitle: media ? <ArchivedStatusBadge isArchived={!!media.isArchived} /> : null,
				avatar: media ? (
					inferKioskGalleryMediaType(media.mediaType) === 'video' ? (
						<IconVideo size={30} />
					) : (
						<IconPhoto size={30} />
					)
				) : undefined,
			}}
			isLoading={isLoading}
			isNotFound={!media && !isLoading}
			drawerProps={{ size: 'xl', opened, onClose }}
		>
			{media && baseApiUrl && previewRow ? (
				<Stack gap='sm'>
					<Box>
						<MediaPreview
							media={previewRow}
							size='lg'
							onClick={() => setPreviewModalOpen(true)}
						/>
					</Box>
					<KioskMediaPreviewModal
						opened={previewModalOpen}
						onClose={() => setPreviewModalOpen(false)}
						media={previewRow}
					/>
					<Divider />
					<DetailField label={translate('kiosk_media.fields.id')} value={media.id} />
					<DetailField
						label={translate('kiosk_media.fields.media_type')}
						value={String(media.mediaType ?? '—')}
					/>
					<DetailField
						label={translate('kiosk_media.fields.storage_key')}
						value={String(media.storageKey ?? '—')}
					/>
					<DetailField
						label={translate('kiosk_media.fields.created_at')}
						value={formatDateTime(media.createdAt)}
					/>
					<DetailField
						label={translate('kiosk_media.fields.updated_at')}
						value={media.updatedAt ? formatDateTime(media.updatedAt) : '—'}
					/>
					<KioskMediaMutationFooter
						media={media}
						translate={translate}
						onRequestDelete={onRequestDelete}
						onRequestArchive={onRequestArchive}
						onRequestRestore={onRequestRestore}
					/>
				</Stack>
			) : media && !baseApiUrl ? (
				<Stack gap='sm'>
					<Text size='sm' c='dimmed'>
						{translate('media_playlist.media.gallery.config_missing')}
					</Text>
					<KioskMediaMutationFooter
						media={media}
						translate={translate}
						onRequestDelete={onRequestDelete}
						onRequestArchive={onRequestArchive}
						onRequestRestore={onRequestRestore}
					/>
				</Stack>
			) : null}
		</PreviewDrawer>
	);
};
