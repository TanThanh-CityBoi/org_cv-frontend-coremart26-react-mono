import { Card, Group, Image, Text } from '@mantine/core';
import { formatCurrency } from '@nikkierp/common/utils';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import React from 'react';

import { KioskProduct } from '../../type';


export type KioskProductCardProps = {
	product: KioskProduct;
	displayName: string;
	selected: boolean;
	onSelect?: (product: KioskProduct) => void;
};

export const KioskProductCard: React.FC<KioskProductCardProps> = ({
	product,
	displayName,
	selected,
	onSelect,
}) => {
	return (
		<Card
			withBorder
			p='xs'
			radius='md'
			onClick={() => onSelect?.(product)}
			style={{ cursor: onSelect ? 'pointer' : 'default' }}
			styles={(theme) => ({
				root: {
					borderColor: selected ? theme.colors.blue[6] : undefined,
					borderWidth: selected ? 2 : 1,
					boxShadow: selected ? theme.shadows.sm : 'none',
				},
			})}
		>
			<Card.Section>
				<Image
					alt=''
					h={108}
					fit='contain'
					src={product.imageUrl || blankPicture}
					onError={(e) => {
						(e.target as HTMLImageElement).src = blankPicture;
					}}
				/>
			</Card.Section>
			<Text size='sm' fw={500} lineClamp={2} mt='xs'>{displayName}</Text>
			<Group justify='space-between' gap='xs' wrap='nowrap' mt={4}>
				<Text size='xs' c='dimmed' lineClamp={1} style={{ flex: 1 }}>{product.sku}</Text>
				<Text size='xs' c='dimmed'>{formatCurrency.VND(Number(product.proposedPrice))}</Text>
			</Group>
		</Card>
	);
};
