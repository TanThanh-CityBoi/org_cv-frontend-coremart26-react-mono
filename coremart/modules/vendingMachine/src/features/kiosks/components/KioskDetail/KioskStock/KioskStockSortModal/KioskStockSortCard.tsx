import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import { ActionIcon, Avatar, Badge, Box, Menu, Text } from '@mantine/core';
import { IconArrowsMove, IconHash } from '@tabler/icons-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocalizedName } from '@/common/helpers';

import type { SortableStock } from './useKioskStockSort';


const PAGE_SIZE = 8;

type CardProps = {
	stock: SortableStock;
	globalIndex: number;
	totalItems: number;
	onMoveToPosition: (stockId: string, targetIndex: number) => void;
};

type ContextMenuProps = {
	opened: boolean;
	onClose: () => void;
	stock: SortableStock;
	globalIndex: number;
	totalItems: number;
	onMoveToPosition: (stockId: string, targetIndex: number) => void;
};

function PositionMenuItems({ stock, globalIndex, totalItems, onMoveToPosition }: Omit<ContextMenuProps, 'opened' | 'onClose'>) {
	const { t: translate } = useTranslation();
	const pages = Math.ceil(totalItems / PAGE_SIZE);

	return (
		<>
			{Array.from({ length: pages }, (_, pageIdx) => {
				const start = pageIdx * PAGE_SIZE;
				const end = Math.min(start + PAGE_SIZE, totalItems);
				const slots = Array.from({ length: end - start }, (__, slotIdx) => start + slotIdx);
				return (
					<React.Fragment key={pageIdx}>
						<Menu.Label>
							{translate('coremart.vendingMachine.kioskStock.sort.page', {
								defaultValue: 'Trang {{n}}',
								n: pageIdx + 1,
							})}
						</Menu.Label>
						{slots.map((targetIdx) => (
							<Menu.Item
								key={targetIdx}
								leftSection={<IconHash size={12} />}
								disabled={targetIdx === globalIndex}
								onClick={() => onMoveToPosition(stock.id, targetIdx)}
							>
								{translate('coremart.vendingMachine.kioskStock.sort.slot', {
									defaultValue: 'Vị trí {{n}}',
									n: targetIdx + 1,
								})}
							</Menu.Item>
						))}
					</React.Fragment>
				);
			})}
		</>
	);
}

export function KioskStockSortCard({
	stock,
	globalIndex,
	totalItems,
	onMoveToPosition,
}: CardProps) {
	const { i18n } = useTranslation();
	const [menuOpened, setMenuOpened] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: stock.id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.35 : 1,
		zIndex: isDragging ? 999 : undefined,
	};

	const handleContextMenu = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setMenuOpened(true);
	}, []);

	const name = getLocalizedName(stock.product?.name, i18n.language) || stock.product?.sku || '—';
	const price = stock.sellPrice ? Number(stock.sellPrice).toLocaleString('vi-VN') + ' đ' : '—';

	return (
		<Menu
			opened={menuOpened}
			onClose={() => setMenuOpened(false)}
			position='bottom-start'
			shadow='md'
			withinPortal
		>
			<Menu.Target>
				<Box
					ref={setNodeRef}
					onContextMenu={handleContextMenu}
					p='xs'
					bd='1px solid var(--mantine-color-gray-3)'
					bg='white'
					style={{
						...style,
						borderRadius: 8,
						userSelect: 'none',
						position: 'relative',
						minHeight: 120,
					}}
				>
					<ActionIcon
						{...attributes}
						{...listeners}
						variant='subtle'
						color='gray'
						size='sm'
						style={{ position: 'absolute', top: 4, right: 4, cursor: 'grab' }}
						aria-label='Drag to reorder'
					>
						<IconArrowsMove size={14} />
					</ActionIcon>

					<Badge
						size='xs'
						variant='light'
						color='blue'
						style={{ position: 'absolute', top: 4, left: 4 }}
					>
						{globalIndex + 1}
					</Badge>

					<Box mt={20} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
						<Avatar
							src={stock.product?.imageUrl || blankPicture}
							alt={name}
							size={56}
							radius='sm'
						/>
						<Text size='xs' fw={600} ta='center' lineClamp={2} style={{ maxWidth: '100%' }}>
							{name}
						</Text>
						<Text size='xs' c='dimmed' ta='center'>{price}</Text>
					</Box>
				</Box>
			</Menu.Target>

			<Menu.Dropdown style={{ maxHeight: 320, overflowY: 'auto' }}>
				<PositionMenuItems
					stock={stock}
					globalIndex={globalIndex}
					totalItems={totalItems}
					onMoveToPosition={onMoveToPosition}
				/>
			</Menu.Dropdown>
		</Menu>
	);
}
