/* eslint-disable max-lines-per-function */
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import {
	ActionIcon, Box, Button, Center, Group, Loader, Modal,
	Pagination, SimpleGrid, Text,
} from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconCheck, IconX } from '@tabler/icons-react';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Kiosk } from '@/features/kiosks/types';

import { KioskStockSortCard } from './KioskStockSortCard';
import { useKioskStockSort } from './useKioskStockSort';


const COLS = 4;
const ROWS = 2;
const PAGE_SIZE = COLS * ROWS;
const AUTO_PAGE_DELAY_MS = 600;

export type KioskStockSortModalProps = {
	kiosk: Kiosk;
	opened: boolean;
	onClose: () => void;
	onSuccess?: () => void;
};

type PageNavZoneProps = {
	direction: 'prev' | 'next';
	disabled: boolean;
	isDragging: boolean;
	onHoverStart: () => void;
	onHoverEnd: () => void;
	onActivate: () => void;
};

function PageNavZone({ direction, disabled, isDragging, onHoverStart, onHoverEnd, onActivate }: PageNavZoneProps) {
	if (disabled) return null;
	return (
		<ActionIcon
			variant={isDragging ? 'filled' : 'light'}
			color='blue'
			size='xl'
			radius='xl'
			style={{ alignSelf: 'center', flexShrink: 0 }}
			aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
			onMouseEnter={onHoverStart}
			onMouseLeave={onHoverEnd}
			onClick={onActivate}
		>
			{direction === 'prev' ? <IconArrowLeft size={20} /> : <IconArrowRight size={20} />}
		</ActionIcon>
	);
}

function EmptySlot() {
	return (
		<Box
			p='xs'
			style={{
				borderRadius: 8,
				minHeight: 120,
				border: '1.5px dashed var(--mantine-color-gray-3)',
				background: 'var(--mantine-color-gray-0)',
			}}
		/>
	);
}

export function KioskStockSortModal({ kiosk, opened, onClose, onSuccess }: KioskStockSortModalProps) {
	const { t: translate } = useTranslation();
	const [page, setPage] = useState(1);
	const [isDragging, setIsDragging] = useState(false);
	const autoPageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const {
		items,
		isFetching,
		isSaving,
		isDirty,
		handleDragEnd,
		handleMoveToPosition,
		handleSave,
		handleDiscard,
	} = useKioskStockSort({ kiosk, onSuccess });

	const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
	const pageStart = (page - 1) * PAGE_SIZE;
	const pageItems = items.slice(pageStart, pageStart + PAGE_SIZE);
	const pageIds = pageItems.map((s) => s.id);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	const clearAutoPage = useCallback(() => {
		if (autoPageTimerRef.current != null) {
			clearTimeout(autoPageTimerRef.current);
			autoPageTimerRef.current = null;
		}
	}, []);

	const startAutoPage = useCallback((direction: 'prev' | 'next') => {
		clearAutoPage();
		autoPageTimerRef.current = setTimeout(() => {
			setPage((prev) => {
				if (direction === 'prev') return Math.max(1, prev - 1);
				return Math.min(totalPages, prev + 1);
			});
		}, AUTO_PAGE_DELAY_MS);
	}, [clearAutoPage, totalPages]);

	const onDragStart = useCallback((_event: DragStartEvent) => {
		setIsDragging(true);
	}, []);

	const onDragEndHandler = useCallback((event: DragEndEvent) => {
		clearAutoPage();
		setIsDragging(false);
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		handleDragEnd(String(active.id), String(over.id));
	}, [clearAutoPage, handleDragEnd]);

	const handleClose = useCallback(() => {
		if (isDirty) handleDiscard();
		onClose();
	}, [isDirty, handleDiscard, onClose]);

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={
				<Group gap='xs'>
					<Text fw={700} size='lg'>
						{translate('coremart.vendingMachine.kioskStock.sort.title', {
							defaultValue: 'Sắp xếp sản phẩm',
						})}
					</Text>
					{isDirty && (
						<Text size='xs' c='orange' fw={500}>
							{translate('coremart.vendingMachine.kioskStock.sort.unsaved', {
								defaultValue: '• Chưa lưu',
							})}
						</Text>
					)}
				</Group>
			}
			size='xl'
			centered
		>
			{isFetching ? (
				<Center py='xl'><Loader /></Center>
			) : (
				<>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragStart={onDragStart}
						onDragEnd={onDragEndHandler}
					>
						<Group gap='xs' align='flex-start' wrap='nowrap'>
							<PageNavZone
								direction='prev'
								disabled={page <= 1}
								isDragging={isDragging}
								onHoverStart={() => isDragging && startAutoPage('prev')}
								onHoverEnd={clearAutoPage}
								onActivate={() => setPage((p) => Math.max(1, p - 1))}
							/>

							<SortableContext items={pageIds} strategy={rectSortingStrategy}>
								<SimpleGrid cols={COLS} spacing='sm' style={{ flex: 1 }}>
									{pageItems.map((stock, slotIdx) => (
										<KioskStockSortCard
											key={stock.id}
											stock={stock}
											globalIndex={pageStart + slotIdx}
											totalItems={items.length}
											onMoveToPosition={(id, targetIdx) => {
												handleMoveToPosition(id, targetIdx);
												setPage(Math.floor(targetIdx / PAGE_SIZE) + 1);
											}}
										/>
									))}
									{Array.from({ length: PAGE_SIZE - pageItems.length }, (_, i) => (
										<EmptySlot key={i} />
									))}
								</SimpleGrid>
							</SortableContext>

							<PageNavZone
								direction='next'
								disabled={page >= totalPages}
								isDragging={isDragging}
								onHoverStart={() => isDragging && startAutoPage('next')}
								onHoverEnd={clearAutoPage}
								onActivate={() => setPage((p) => Math.min(totalPages, p + 1))}
							/>
						</Group>
					</DndContext>

					{totalPages > 1 && (
						<Center mt='md'>
							<Pagination
								value={page}
								onChange={setPage}
								total={totalPages}
								size='sm'
							/>
						</Center>
					)}

					<Group justify='flex-end' mt='lg' gap='sm'>
						<Button
							variant='default'
							leftSection={<IconX size={16} />}
							onClick={handleClose}
							disabled={isSaving}
						>
							{translate('nikki.general.actions.cancel')}
						</Button>
						{isDirty && (
							<Button
								variant='light'
								color='gray'
								onClick={handleDiscard}
								disabled={isSaving}
							>
								{translate('nikki.general.actions.discard', { defaultValue: 'Huỷ thay đổi' })}
							</Button>
						)}
						<Button
							leftSection={<IconCheck size={16} />}
							onClick={handleSave}
							loading={isSaving}
							disabled={!isDirty}
						>
							{translate('nikki.general.actions.save')}
						</Button>
					</Group>
				</>
			)}
		</Modal>
	);
}
