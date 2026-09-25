import { ActionIcon, Box, Button, Card, Group, ScrollArea, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';

import { MediaPreview } from '../MediaPreview';

import type { GalleryMedia } from '../../types';


export interface SelectedMediaStripProps {
	items: GalleryMedia[];
	selectedMediaTitle: string;
	removeAriaLabel: string;
	cancelLabel: string;
	addLabel: string;
	onRemove: (item: GalleryMedia) => void;
	onCancel: () => void;
	onConfirm: () => void | Promise<void>;
	confirmLoading?: boolean;
}

export const SelectedMediaStrip: React.FC<SelectedMediaStripProps> = ({
	items,
	selectedMediaTitle,
	removeAriaLabel,
	cancelLabel,
	addLabel,
	onRemove,
	onCancel,
	onConfirm,
	confirmLoading,
}) => (
	<Stack gap='xs'>
		<Text size='sm' fw={500} c='dimmed'>
			{selectedMediaTitle} ({items.length})
		</Text>
		<ScrollArea h={120} type='scroll'>
			<SimpleGrid cols={{ base: 4, sm: 5, md: 6 }} spacing={6}>
				{items.map((item) => (
					<Card
						key={item.id}
						withBorder
						padding={4}
						radius='sm'
						style={{ position: 'relative' }}
					>
						<ActionIcon
							variant='filled'
							color='red'
							size='xs'
							radius='xl'
							aria-label={removeAriaLabel}
							style={{ position: 'absolute', top: 2, right: 2, zIndex: 1 }}
							onClick={(e) => {
								e.stopPropagation();
								onRemove(item);
							}}
						>
							<IconTrash size={12} />
						</ActionIcon>
						<Box
							style={{
								display: 'flex',
								justifyContent: 'center',
								transform: 'scale(0.72)',
								transformOrigin: 'top center',
								marginBottom: -14,
							}}
						>
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
						</Box>
						<Text size='xs' lineClamp={1} ta='center' c='dimmed' style={{ lineHeight: 1.2 }}>
							{item.name}
						</Text>
					</Card>
				))}
			</SimpleGrid>
		</ScrollArea>
		<Group justify='flex-end' gap='xs' mt={4}>
			<Button variant='subtle' size='xs' onClick={onCancel} disabled={confirmLoading}>
				{cancelLabel}
			</Button>
			<Button size='xs' onClick={() => void onConfirm()} loading={confirmLoading}>
				{addLabel} ({items.length})
			</Button>
		</Group>
	</Stack>
);
