import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Badge, Box, Flex, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconEye, IconGripVertical, IconTrash } from '@tabler/icons-react';
import React from 'react';

import { MediaPreview } from '../MediaPreview';

import type { PlaylistMediaRow } from '../../types';


const PREVIEW_ACTIVE_BG = 'var(--mantine-color-blue-0)';
const PREVIEW_ACTIVE_RING = 'var(--mantine-color-blue-filled)';

function formatDuration(seconds?: number) {
	if (seconds === undefined || seconds === null) return '-';
	const s = Math.round(seconds);
	const mins = Math.floor(s / 60);
	const secs = s % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export interface MediaItemProps {
	item: PlaylistMediaRow;
	onPreview: (row: PlaylistMediaRow) => void;
	onEdit: (row: PlaylistMediaRow) => void;
	onRemove: (id: string) => void;
	onPreviewMediaSelect?: (row: PlaylistMediaRow) => void;
	isActivePreview?: boolean;
	translate: (key: string) => string;
	readOnly?: boolean;
}

type ActionsProps = Pick<
	MediaItemProps,
	'item' | 'onPreview' | 'onEdit' | 'onRemove' | 'onPreviewMediaSelect' | 'translate' | 'readOnly'
>;

function MediaItemActionsCell({
	readOnly,
	item,
	onPreview,
	onEdit,
	onRemove,
	onPreviewMediaSelect,
	translate,
}: ActionsProps) {
	const openPreview = () => onPreview(item);
	if (readOnly) {
		return (
			<Tooltip label={translate('media_playlist.media.preview_modal_title')}>
				<ActionIcon
					variant='subtle'
					size='sm'
					onClick={(e) => {
						e.stopPropagation();
						// onPreviewMediaSelect?.(item);
						openPreview();
					}}
					aria-label={translate('media_playlist.media.preview')}
				>
					<IconEye size={16} />
				</ActionIcon>
			</Tooltip>
		);
	}
	return (
		<Group gap={4} wrap='nowrap'>
			<Tooltip label={translate('media_playlist.media.edit')}>
				<ActionIcon
					variant='subtle'
					size='sm'
					onClick={(e) => {
						e.stopPropagation();
						onPreviewMediaSelect?.(item);
						onEdit(item);
					}}
				>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('action.delete')}>
				<ActionIcon
					variant='subtle'
					color='red'
					size='sm'
					onClick={(e) => {
						e.stopPropagation();
						onRemove(item.id);
					}}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

// eslint-disable-next-line max-lines-per-function -- DnD + row layout
export function MediaItem({
	item,
	onPreview,
	onEdit,
	onRemove,
	onPreviewMediaSelect,
	isActivePreview,
	translate,
	readOnly,
}: MediaItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id, disabled: readOnly });

	const rowStyle: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.85 : 1,
		cursor: readOnly ? 'default' : 'pointer',
		...(isActivePreview
			? {
				backgroundColor: PREVIEW_ACTIVE_BG,
				borderRadius: 8,
				boxShadow: `inset 0 0 0 1px ${PREVIEW_ACTIVE_RING}`,
			}
			: {}),
		padding: '6px 8px',
	};

	const openPreviewModal = () => onPreview(item);
	const thumbClick = readOnly
		? () => {
			// onPreviewMediaSelect?.(item);
			openPreviewModal();
		}
		: () => {
			// onPreviewMediaSelect?.(item);
			onEdit(item);
		};

	return (
		<Box
			ref={setNodeRef}
			onClick={() => onPreviewMediaSelect?.(item)}
			style={rowStyle}
		>
			<Flex gap={{base: 'xs', sm: 'sm', md: 'md'}} wrap='nowrap' align='stretch' justify='flex-start' w={'100%'} px={'xs'}>
				<Flex
					w={30}
					align='center'
					justify='center'
					onClick={(e) => e.stopPropagation()}
				>
					<div
						{...attributes}
						{...listeners}
						style={{ cursor: 'grab', touchAction: 'none', display: 'inline-flex' }}
						aria-label={translate('media_playlist.media.drag_hint')}
					>
						<IconGripVertical size={18} />
					</div>
				</Flex>
				<Box style={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
					<MediaPreview media={item} size='sm' onClick={thumbClick} />
				</Box>
				<Stack gap='xs' miw={40} flex={1}>
					<Text size='sm' lineClamp={2}>
						{item.name}
					</Text>
					<Text size='sm'>{formatDuration(item.durationSec)}</Text>
				</Stack>
				<Box style={{ display: 'flex', alignItems: 'center' }}>
					<Badge color={item.type === 'image' ? 'blue' : 'red'} size='sm'>
						{item.type === 'image'
							? translate('media_playlist.media.type.image')
							: translate('media_playlist.media.type.video')}
					</Badge>
				</Box>
				<Flex align='center' justify='flex-end' w={40}>
					<MediaItemActionsCell
						readOnly={readOnly}
						item={item}
						onPreview={onPreview}
						onEdit={onEdit}
						onRemove={onRemove}
						onPreviewMediaSelect={onPreviewMediaSelect}
						translate={translate}
					/>
				</Flex>
			</Flex>
		</Box>
	);
}
