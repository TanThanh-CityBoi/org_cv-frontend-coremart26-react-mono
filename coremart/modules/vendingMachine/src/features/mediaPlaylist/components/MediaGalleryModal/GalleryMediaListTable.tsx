import { Table } from '@mantine/core';
import React from 'react';

import { GalleryMediaListRow } from './GalleryMediaListRow';

import type { GalleryMedia } from '../../types';


export interface GalleryMediaListTableProps {
	items: GalleryMedia[];
	selectedIds: Set<string>;
	selectedMediaIdsInPlaylist: string[];
	previewLabel: string;
	nameLabel: string;
	sizeLabel: string;
	alreadyInPlaylistLabel: string;
	onToggle: (item: GalleryMedia) => void;
}

export const GalleryMediaListTable: React.FC<GalleryMediaListTableProps> = ({
	items,
	selectedIds,
	selectedMediaIdsInPlaylist,
	previewLabel,
	nameLabel,
	sizeLabel,
	alreadyInPlaylistLabel,
	onToggle,
}) => (
	<Table.ScrollContainer minWidth={500} type='native'>
		<Table verticalSpacing='xs' style={{ tableLayout: 'fixed' }}>
			<Table.Thead>
				<Table.Tr>
					<Table.Th w={30} style={{ whiteSpace: 'nowrap' }} />
					<Table.Th w={100} style={{ whiteSpace: 'nowrap' }}>
						{previewLabel}
					</Table.Th>
					<Table.Th style={{ whiteSpace: 'nowrap', minWidth: 160 }}>
						{nameLabel}
					</Table.Th>
					<Table.Th w={88} style={{ whiteSpace: 'nowrap' }}>
						{sizeLabel}
					</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{items.map((item) => (
					<GalleryMediaListRow
						key={item.id}
						item={item}
						isSelected={selectedIds.has(item.id)}
						isAlreadyInPlaylist={selectedMediaIdsInPlaylist.includes(item.id)}
						alreadyInPlaylistLabel={alreadyInPlaylistLabel}
						onToggle={onToggle}
					/>
				))}
			</Table.Tbody>
		</Table>
	</Table.ScrollContainer>
);
