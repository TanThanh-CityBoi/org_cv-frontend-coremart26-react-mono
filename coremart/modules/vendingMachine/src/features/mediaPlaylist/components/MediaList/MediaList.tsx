import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
	Box,
	Button,
	Divider,
	Group,
	Image,
	Modal,
	NumberInput,
	Select,
	SegmentedControl,
	Stack,
	Text,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MediaItem } from './MediaItem';
import { ObjectFit, normalizePlaylistObjectFit, type PlaylistMediaRow } from '../../types';



const MAX_PRESENTATION_DURATION_SEC = 300; // 5 minutes

export interface MediaListProps {
	maxHeight?: number;
	media: PlaylistMediaRow[];
	onAddMedia: () => void;
	onRemoveMedia: (mediaId: string) => void;
	onMediaChange: (items: PlaylistMediaRow[]) => void;
	/** When true, list is display-only (no add, reorder, edit, or remove). */
	readOnly?: boolean;
	/** Khi người dùng chọn một media (thumbnail / xem) — đồng bộ xem trước khu vực preview trang. */
	onPreviewMediaSelect?: (row: PlaylistMediaRow) => void;
	/** Id media đang hiển thị ở preview cột phải (khớp timeline / chạy thử) — tô viền xanh hàng tương ứng. */
	activePreviewMediaId?: string | null;
}

const sortByPlayOrder = (rows: PlaylistMediaRow[]) =>
	[...rows].sort((a, b) => a.order - b.order);

const renumberOrders = (rows: PlaylistMediaRow[]) =>
	rows.map((row, index) => ({ ...row, order: index + 1 }));

type ModalPreviewAspect = '16:9' | '9:16';

function MediaModalPreviewPane({
	media,
	fit,
	aspectRatio,
}: {
	media: PlaylistMediaRow;
	fit: ObjectFit;
	aspectRatio: ModalPreviewAspect;
}) {
	const frameStyle: React.CSSProperties =
		aspectRatio === '16:9'
			? {
				// width: '100%',
				width: 'auto',
				height: 300,
				aspectRatio: '16 / 9',
			}
			: {
				// width: 'min(100%, 220px)',
				width: 'auto',
				height: 300,
				aspectRatio: '9 / 16',
			};

	return (
		<Stack gap='xs' align='center'>
			<Box
				style={{
					...frameStyle,
					marginLeft: 'auto',
					marginRight: 'auto',
					overflow: 'hidden',
					borderRadius: 8,
					backgroundColor: 'var(--mantine-color-gray-1)',
				}}
			>
				{media.type === 'image' ? (
					<Image src={media.url} alt={media.name} fit={fit} w='100%' h='100%' />
				) : (
					<video
						src={media.url}
						controls
						style={{
							width: '100%',
							height: '100%',
							display: 'block',
							objectFit: fit,
						}}
					/>
				)}
			</Box>
			<Text size='sm' c='dimmed' ta='center'>
				{media.name}
			</Text>
		</Stack>
	);
}

interface MediaItemPreviewModalProps {
	opened: boolean;
	onClose: () => void;
	/** Chỉ xem trước + chuyển tỉ lệ; không chỉnh duration / thứ tự / object fit. */
	readOnly?: boolean;
	media: PlaylistMediaRow | null;
	listLength: number;
	onSave: (id: string, durationSec: number, playOrder: number, objectFit: ObjectFit) => void;
	labels: {
		title: string;
		previewTitle: string;
		duration: string;
		playOrder: string;
		objectFit: string;
		save: string;
		cancel: string;
	};
}

interface MediaItemPreviewModalBodyProps {
	readOnly: boolean;
	media: PlaylistMediaRow;
	duration: number | string;
	setDuration: React.Dispatch<React.SetStateAction<number | string>>;
	playOrder: number | string;
	setPlayOrder: React.Dispatch<React.SetStateAction<number | string>>;
	objectFit: ObjectFit;
	setObjectFit: React.Dispatch<React.SetStateAction<ObjectFit>>;
	previewViewMode: ModalPreviewAspect;
	setPreviewViewMode: React.Dispatch<React.SetStateAction<ModalPreviewAspect>>;
	listLength: number;
	objectFitOptions: { value: ObjectFit; label: string }[];
	labels: MediaItemPreviewModalProps['labels'];
	onClose: () => void;
	handleSubmit: () => void;
}

function MediaItemPreviewModalBody({
	readOnly,
	media,
	duration,
	setDuration,
	playOrder,
	setPlayOrder,
	objectFit,
	setObjectFit,
	previewViewMode,
	setPreviewViewMode,
	listLength,
	objectFitOptions,
	labels,
	onClose,
	handleSubmit,
}: MediaItemPreviewModalBodyProps) {
	const { t: translate } = useTranslation();

	return (
		<Stack gap='xs'>
			<MediaModalPreviewPane media={media} fit={objectFit} aspectRatio={previewViewMode} />
			<Group justify='center'>
				<SegmentedControl
					size='xs'
					value={previewViewMode}
					onChange={(v) => setPreviewViewMode(v as ModalPreviewAspect)}
					data={[
						{ label: '16:9', value: '16:9' },
						{ label: '9:16', value: '9:16' },
					]}
					aria-label={translate('coremart.vendingMachine.mediaPlaylist.media.preview_aspect_ratio')}
				/>
			</Group>
			<Divider />
			<NumberInput
				label={labels.duration}
				min={0}
				max={MAX_PRESENTATION_DURATION_SEC}
				value={duration}
				onChange={setDuration}
				readOnly={readOnly}
			/>
			<NumberInput
				label={labels.playOrder}
				min={1}
				max={Math.max(0, listLength - 1)}
				value={playOrder}
				onChange={setPlayOrder}
				readOnly={readOnly}
			/>
			<Select
				label={labels.objectFit}
				data={objectFitOptions}
				value={objectFit}
				onChange={(v) => v && setObjectFit(v as ObjectFit)}
				clearable={false}
				readOnly={readOnly}
			/>
			<Group justify='flex-end' mt='sm'>
				<Button variant='default' onClick={onClose} disabled={readOnly}>
					{labels.cancel}
				</Button>
				<Button onClick={handleSubmit} disabled={readOnly}>{labels.save}</Button>
			</Group>
		</Stack>
	);
}

function MediaItemPreviewModal({
	opened,
	onClose,
	readOnly = false,
	media,
	listLength,
	onSave,
	labels,
}: MediaItemPreviewModalProps) {
	const { t: translate } = useTranslation();
	const [duration, setDuration] = useState<number | string>(0);
	const [playOrder, setPlayOrder] = useState<number | string>(1);
	const [objectFit, setObjectFit] = useState<ObjectFit>(normalizePlaylistObjectFit(media?.objectFit));
	const [previewViewMode, setPreviewViewMode] = useState<ModalPreviewAspect>('16:9');

	const objectFitOptions = useMemo(
		() =>
			Object.values(ObjectFit).map((v) => ({
				value: v,
				label: translate(`coremart.vendingMachine.mediaPlaylist.media.object_fit_option.${v}`),
			})),
		[translate],
	);

	useEffect(() => {
		if (!media) return;
		setDuration(media.durationSec ?? 0);
		setPlayOrder(media.order);
		setObjectFit(normalizePlaylistObjectFit(media.objectFit));
		setPreviewViewMode('16:9');
	}, [media]);

	const handleSubmit = () => {
		if (!media) return;
		const dur = typeof duration === 'string' ? Number(duration) : duration;
		const ord = typeof playOrder === 'string' ? Number(playOrder) : playOrder;
		const safeDur = Number.isFinite(dur) && dur >= 0 ? dur : 0;
		const safeOrd =
			Number.isFinite(ord) ? Math.min(Math.max(1, Math.floor(ord)), listLength) : 1;
		onSave(media.id, safeDur, safeOrd, objectFit);
		onClose();
	};

	const modalTitle = readOnly ? labels.previewTitle : labels.title;

	return (
		<Modal opened={opened} onClose={onClose} title={modalTitle} size='lg' centered>
			{media ? (
				<MediaItemPreviewModalBody
					media={media}
					duration={duration}
					setDuration={setDuration}
					playOrder={playOrder}
					setPlayOrder={setPlayOrder}
					objectFit={objectFit}
					setObjectFit={setObjectFit}
					previewViewMode={previewViewMode}
					setPreviewViewMode={setPreviewViewMode}
					listLength={listLength}
					objectFitOptions={objectFitOptions}
					labels={labels}
					onClose={onClose}
					handleSubmit={handleSubmit}
					readOnly={readOnly}
				/>
			) : null}
		</Modal>
	);
}

// eslint-disable-next-line max-lines-per-function -- table + DnD + modals
export const MediaList: React.FC<MediaListProps> = ({
	media,
	maxHeight,
	onAddMedia,
	onRemoveMedia,
	onMediaChange,
	readOnly = false,
	onPreviewMediaSelect,
	activePreviewMediaId,
}) => {
	const { t: translate } = useTranslation();
	const [detailRow, setDetailRow] = useState<PlaylistMediaRow | null>(null);

	const sortedMedia = useMemo(() => sortByPlayOrder(media), [media]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const ordered = sortByPlayOrder(media);
		const oldIndex = ordered.findIndex(i => i.id === active.id);
		const newIndex = ordered.findIndex(i => i.id === over.id);
		if (oldIndex < 0 || newIndex < 0) return;
		const moved = arrayMove(ordered, oldIndex, newIndex);
		onMediaChange(renumberOrders(moved));
	};

	const handleEditSave = (id: string, durationSec: number, playOrder: number, objectFit: ObjectFit) => {
		const ordered = sortByPlayOrder(media);
		const curIdx = ordered.findIndex(r => r.id === id);
		if (curIdx < 0) return;
		const newIndex = Math.min(Math.max(0, playOrder - 1), ordered.length - 1);
		const withDuration = ordered.map(r =>
			r.id === id ? { ...r, durationSec, objectFit } : r,
		);
		const moved = arrayMove(withDuration, curIdx, newIndex);
		onMediaChange(renumberOrders(moved));
	};

	const editLabels = {
		title: translate('coremart.vendingMachine.mediaPlaylist.media.edit_modal_title'),
		previewTitle: translate('coremart.vendingMachine.mediaPlaylist.media.preview_modal_title'),
		duration: translate('coremart.vendingMachine.mediaPlaylist.media.fields.duration'),
		playOrder: translate('coremart.vendingMachine.mediaPlaylist.media.play_order'),
		objectFit: translate('coremart.vendingMachine.mediaPlaylist.media.fields.object_fit'),
		save: translate('nikki.general.actions.save'),
		cancel: translate('nikki.general.actions.cancel'),
	};


	if (media.length === 0) {
		return (
			<Stack gap='md'>
				<Group justify='space-between' align='top' h={30}>
					<Text size='sm' fw={500}>
						{translate('coremart.vendingMachine.mediaPlaylist.media.title')}
					</Text>
					{!readOnly ? (
						<Button size='xs' leftSection={<IconPlus size={16} />} onClick={onAddMedia}>
							{translate('coremart.vendingMachine.mediaPlaylist.media.add')}
						</Button>
					) : null}
				</Group>
				<Text size='sm' c='dimmed' ta='center' py='xl'>
					{translate('coremart.vendingMachine.mediaPlaylist.media.empty')}
				</Text>
			</Stack>
		);
	}

	const listBody = (
		<Stack gap={6} style={{ width: '100%' }}>
			{sortedMedia.map(item => (
				<MediaItem
					key={item.id}
					item={item}
					onPreview={setDetailRow}
					onEdit={setDetailRow}
					onRemove={onRemoveMedia}
					onPreviewMediaSelect={onPreviewMediaSelect}
					isActivePreview={activePreviewMediaId != null && item.id === activePreviewMediaId}
					translate={translate}
					readOnly={readOnly}
				/>
			))}
		</Stack>
	);

	return (
		<>
			<Stack gap='sm'>
				<Group justify='space-between' h={30}>
					<Text size='sm' fw={500}>
						{translate('coremart.vendingMachine.mediaPlaylist.media.title')} ({media.length})
					</Text>
					{!readOnly ? (
						<Button size='xs' leftSection={<IconPlus size={16} />} onClick={onAddMedia}>
							{translate('coremart.vendingMachine.mediaPlaylist.media.add')}
						</Button>
					) : null}
				</Group>

				<Box style={{ maxHeight: maxHeight ?? 'auto', overflowY: 'auto' }}>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={readOnly ? () => undefined : handleDragEnd}
					>
						<SortableContext
							items={sortedMedia.map(i => i.id)}
							strategy={verticalListSortingStrategy}
						>
							{listBody}
						</SortableContext>
					</DndContext>
				</Box>
			</Stack>

			<MediaItemPreviewModal
				readOnly={readOnly}
				opened={detailRow !== null}
				onClose={() => setDetailRow(null)}
				media={detailRow}
				listLength={sortedMedia.length}
				onSave={handleEditSave}
				labels={editLabels}
			/>
		</>
	);
};
