import { Table, Text } from '@mantine/core';
import React from 'react';

import { formatGalleryDuration, formatGalleryFileSize } from './mediaGalleryUtils';
import { MediaPreview } from '../MediaPreview';

import type { GalleryMedia } from '../../types';


export interface GalleryMediaListRowProps {
	item: GalleryMedia;
	isSelected: boolean;
	isAlreadyInPlaylist: boolean;
	alreadyInPlaylistLabel: string;
	onToggle: (item: GalleryMedia) => void;
}

export const GalleryMediaListRow: React.FC<GalleryMediaListRowProps> = ({
	item,
	isSelected,
	isAlreadyInPlaylist,
	alreadyInPlaylistLabel,
	onToggle,
}) => (
	<Table.Tr
		onClick={() => {
			if (!isAlreadyInPlaylist) onToggle(item);
		}}
		style={{
			cursor: isAlreadyInPlaylist ? 'not-allowed' : 'pointer',
			backgroundColor: isSelected
				? '#e7f5ff'
				: isAlreadyInPlaylist
					? '#fff5f5'
					: undefined,
			opacity: isAlreadyInPlaylist ? 0.6 : 1,
			verticalAlign: 'middle',
		}}
	>
		<Table.Td style={{ whiteSpace: 'nowrap' }}>
			{isSelected && <Text c='blue' component='span'>✓</Text>}
			{isAlreadyInPlaylist && (
				<Text c='red' size='xs' component='span' ml={4}>
					{alreadyInPlaylistLabel}
				</Text>
			)}
		</Table.Td>
		<Table.Td style={{ verticalAlign: 'middle' }}>
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
				size='sm'
			/>
		</Table.Td>
		<Table.Td style={{ verticalAlign: 'middle', maxWidth: 280 }}>
			<Text size='sm' lineClamp={1}>
				{item.name}
			</Text>
			<Text size='sm'>{formatGalleryDuration(item.duration)}</Text>
		</Table.Td>
		<Table.Td style={{ whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
			<Text size='sm'>{formatGalleryFileSize(item.size)}</Text>
		</Table.Td>
	</Table.Tr>
);
