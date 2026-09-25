import { SimpleGrid, SimpleGridProps } from '@mantine/core';

import { KioskMediaCard } from '../KioskMediaCard';
import { KioskMediaTableActions } from '../KioskMediaTable/KioskMediaTable';

import type { GalleryMedia } from '../../types';


export interface KioskMediaGridProps {
	items: GalleryMedia[];
	selectedIds: Set<string>;
	selectedMediaIdsInPlaylist: string[];
	alreadyInPlaylistLabel: string;
	onToggle: (item: GalleryMedia) => void;
	/** Trang browse: không tương tác chọn media. */
	readOnly?: boolean;
	/** Khi `readOnly`, bấm card để mở chi tiết (vd. drawer). */
	onItemOpen?: (item: GalleryMedia) => void;
	/** Góc thẻ (vd. menu ⋮) — không bubble ra card. `cardRef` = thẻ card (chuột phải mở menu). */
	actions?: KioskMediaTableActions;
	cols?: SimpleGridProps['cols'];
}

export function KioskMediaGrid({
	items,
	selectedIds,
	selectedMediaIdsInPlaylist,
	alreadyInPlaylistLabel,
	onToggle,
	readOnly = false,
	onItemOpen,
	actions,
	cols = { base: 1, sm: 2, md: 3, lg: 5 },
}: KioskMediaGridProps) {
	return (
		<SimpleGrid cols={cols} spacing='md'>
			{items.map((item) => (
				<KioskMediaCard
					key={item.id}
					item={item}
					isSelected={selectedIds.has(item.id)}
					isAlreadyInPlaylist={selectedMediaIdsInPlaylist.includes(item.id)}
					alreadyInPlaylistLabel={alreadyInPlaylistLabel}
					onToggle={onToggle}
					readOnly={readOnly}
					onOpenDetail={readOnly ? onItemOpen : undefined}
					actions={actions}
				/>
			))}
		</SimpleGrid>
	);
}
