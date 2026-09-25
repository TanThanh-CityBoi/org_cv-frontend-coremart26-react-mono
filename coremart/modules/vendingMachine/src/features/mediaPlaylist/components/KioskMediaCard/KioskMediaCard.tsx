import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { IconPhoto, IconVideo } from '@tabler/icons-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CardActionMenu } from '@/components';

import { getKioskMediaTableActions, KioskMediaTableActions } from '../KioskMediaTable/KioskMediaTable';
import { formatGalleryDuration } from '../MediaGalleryModal/mediaGalleryUtils';
import { MediaPreview } from '../MediaPreview';

import type { GalleryMedia, KioskMedia } from '../../types';


export interface KioskMediaCardProps {
	item: GalleryMedia;
	isSelected: boolean;
	isAlreadyInPlaylist: boolean;
	alreadyInPlaylistLabel: string;
	onToggle: (item: GalleryMedia) => void;
	/** Khi true (vd. trang danh sách): chỉ xem, không chọn / không badge playlist. */
	readOnly?: boolean;
	/** `readOnly` + callback: mở chi tiết khi bấm card. */
	onOpenDetail?: (item: GalleryMedia) => void;
	actions?: KioskMediaTableActions;
}

// eslint-disable-next-line max-lines-per-function -- card layout + preview + optional overlays
export const KioskMediaCard: React.FC<KioskMediaCardProps> = ({
	item,
	isSelected,
	isAlreadyInPlaylist,
	alreadyInPlaylistLabel,
	onToggle,
	readOnly = false,
	onOpenDetail,
	actions,
}) => {
	const cardRef = useRef<HTMLDivElement>(null);
	const { t: translate } = useTranslation();
	const actionsMenuItems = getKioskMediaTableActions(item as unknown as KioskMedia, actions ?? {}, translate);

	return (
		<Box
			ref={cardRef}
			onClick={
				readOnly && onOpenDetail
					? () => onOpenDetail(item)
					: readOnly || isAlreadyInPlaylist
						? undefined
						: () => onToggle(item)
			}
			style={{
				cursor:
					readOnly && onOpenDetail
						? 'pointer'
						: readOnly
							? 'default'
							: isAlreadyInPlaylist
								? 'not-allowed'
								: 'pointer',
				border: `1px solid ${
					readOnly ? '#e9ecef' : isSelected ? '#228be6' : isAlreadyInPlaylist ? '#ff6b6b' : '#e9ecef'
				}`,
				boxShadow: `0 2px 4px rgba(0, 0, 0, 0.05)`,
				borderRadius: 8,
				padding: 8,
				backgroundColor:
					readOnly ? 'white' : isSelected ? '#e7f5ff' : isAlreadyInPlaylist ? '#fff5f5' : 'white',
				opacity: readOnly ? 1 : isAlreadyInPlaylist ? 0.6 : 1,
			}}
		>
			<Stack gap='xs'>
				<Box style={{ position: 'relative' }}>
					<MediaPreview
						media={{
							id: item.id,
							kioskMediaRef: item.id,
							name: item.name,
							type: item.type,
							url: item.url,
							thumbnailUrl: item.thumbnailUrl,
							durationSec: item.duration,
							order: 0,
						}}
						size='md'
					/>
					{!readOnly && isSelected ? (
						<Badge
							color='blue'
							style={{
								position: 'absolute',
								top: 4,
								right: 4,
							}}
						>
							✓
						</Badge>
					) : null}
					{!readOnly && isAlreadyInPlaylist ? (
						<Badge
							color='red'
							style={{
								position: 'absolute',
								top: 4,
								right: 4,
							}}
						>
							{alreadyInPlaylistLabel}
						</Badge>
					) : null}

					{
						actionsMenuItems.length > 0 ? (
							<CardActionMenu
								items={actionsMenuItems}
								contextMenuContainerRef={cardRef}
							/>
						) : null
					}
				</Box>
				<Text size='xs' fw={500} lineClamp={1}>
					{item.name}
				</Text>
				<Group gap='xs' justify='space-between'>
					<Badge size='xs' color={item.type === 'image' ? 'blue' : 'red'}>
						{item.type === 'image' ? (
							<IconPhoto size={12} />
						) : (
							<IconVideo size={12} />
						)}
					</Badge>
					{item.duration ? (
						<Text size='xs' c='dimmed'>
							{formatGalleryDuration(item.duration)}
						</Text>
					) : null}
				</Group>
			</Stack>
		</Box>
	);
};
