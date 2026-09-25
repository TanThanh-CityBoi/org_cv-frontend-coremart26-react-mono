import { ActionIcon, Box, Menu } from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';
import React, { useEffect, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { type TableActionItem } from '@/components/Table';


export type CardActionMenuProps = {
	items: TableActionItem[];
	/** Chuột phải trên phần tử này (thẻ card) mở cùng menu thao tác. */
	contextMenuContainerRef?: RefObject<HTMLElement | null>;
};

function MenuItems({ items }: { items: TableActionItem[] }) {
	return (
		<>
			{items.map((action) => (
				<Menu.Item
					key={action.key}
					leftSection={action.icon}
					color={action.color}
					onClick={action.onClick}
				>
					{action.label}
				</Menu.Item>
			))}
		</>
	);
}

export const CardActionMenu: React.FC<CardActionMenuProps> = ({
	items,
	contextMenuContainerRef,
}) => {
	const { t: translate } = useTranslation();
	const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const el = contextMenuContainerRef?.current;
		if (!el) return;
		const onCtx = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setContextPos({ x: e.clientX, y: e.clientY });
		};
		el.addEventListener('contextmenu', onCtx);
		return () => el.removeEventListener('contextmenu', onCtx);
	}, [contextMenuContainerRef]);

	if (items.length === 0) return null;

	return (
		<>
			<Box style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
				<Menu withinPortal position='bottom-end'>
					<Menu.Target>
						<ActionIcon
							size='sm'
							variant='default'
							radius='sm'
							aria-label={translate('nikki.general.actions.title')}
						>
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown onClick={(e) => e.stopPropagation()}>
						<MenuItems items={items} />
					</Menu.Dropdown>
				</Menu>
			</Box>
			{contextPos !== null ? (
				<Menu
					opened
					onChange={(open) => {
						if (!open) setContextPos(null);
					}}
					withinPortal
					position='bottom-start'
					offset={2}
				>
					<Menu.Target>
						<Box
							style={{
								position: 'fixed',
								left: contextPos.x,
								top: contextPos.y,
								width: 1,
								height: 1,
								padding: 0,
								margin: 0,
								border: 'none',
								pointerEvents: 'none',
							}}
						/>
					</Menu.Target>
					<Menu.Dropdown onClick={(e) => e.stopPropagation()}>
						<MenuItems items={items} />
					</Menu.Dropdown>
				</Menu>
			) : null}
		</>
	);
};
