import { Box, Group, Image, Paper, Stack, Text } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getLocalizedName } from '../../../../common/helpers';
import { formatOrderMoney } from '../../formatters';

import type { VdOrder, VdOrderCurrency, VdOrderItem } from '../../types';


function readInfoString(info: unknown, key: string): string | undefined {
	if (info && typeof info === 'object' && info !== null && key in info) {
		const v = (info as Record<string, unknown>)[key];
		return v != null && v !== '' ? String(v) : undefined;
	}
	return undefined;
}

function Pipe() {
	return (
		<Box
			component='span'
			style={{ width: 1, height: 14, background: 'var(--mantine-color-gray-4)', flexShrink: 0 }}
		/>
	);
}

function OrderItemThumb({ imageUrl }: { imageUrl?: string }) {
	return (
		<Box
			w={64}
			h={64}
			style={{
				borderRadius: 8,
				overflow: 'hidden',
				flexShrink: 0,
				background: 'var(--mantine-color-gray-1)',
			}}
		>
			{imageUrl ? (
				<Image src={imageUrl} alt='' w={64} h={64} fit='cover' />
			) : (
				<Box w={64} h={64} style={{ display: 'grid', placeItems: 'center' }}>
					<IconPackage size={28} color='var(--mantine-color-gray-5)' />
				</Box>
			)}
		</Box>
	);
}

type MetaProps = { item: VdOrderItem };

function OrderItemMetaLine({ item }: MetaProps) {
	const { t: translate } = useTranslation('vending_machine');
	return (
		<Stack gap={6}>
			<Text size='sm' c='dimmed' lineClamp={1}>SKU: {item.productInfo?.sku ?? '—'}</Text>
			<Group>
				<Text size='sm' c='dimmed'>
					{translate('kiosk.stocks.fields.proposed_price')}
					{': '}
					{formatOrderMoney(item.productInfo?.proposedPrice, 'VND')}
				</Text>
				<Pipe />
				<Text size='sm' c='dimmed'>
					{translate('kiosk.stocks.fields.sell_price')}
					{': '}
					{formatOrderMoney(item.sellPrice, 'VND')}
				</Text>
				{/* <Text size='sm' c='dimmed'>
					{translate('orders.items.quantity_out')}
					{': '}
					{item.quantityOut != null ? String(item.quantityOut) : '—'}
				</Text> */}
			</Group>
			<Text size='sm' c='dimmed'>
				{translate('orders.items.quantity')}
				{': '}
				{item.quantity != null ? String(item.quantity) : '—'}
			</Text>
		</Stack>
	);
}

type OrderItemLineCardProps = { item: VdOrderItem, currency: VdOrderCurrency };

export const OrderItemLineCard: React.FC<OrderItemLineCardProps> = ({ item, currency }) => {
	const { i18n } = useTranslation('vending_machine');
	const productName = getLocalizedName(item.productInfo?.name, i18n.language);
	const imageUrl = readInfoString(item.productInfo, 'imageUrl')
		?? readInfoString(item.productInfo, 'image')
		?? readInfoString(item.productInfo, 'thumbUrl');
	const unit = formatOrderMoney(item.sellPrice, currency);
	const lineTotal = formatOrderMoney(
		String(Number(item.quantity) * Number(item.sellPrice)),
		currency,
	);

	return (
		<Paper withBorder p='md' radius='md'>
			<Group justify='space-between' align='center' wrap='nowrap' gap='md'>
				<Group align='start' wrap='nowrap' gap='md' style={{ flex: 1, minWidth: 0 }}>
					<OrderItemThumb imageUrl={imageUrl} />
					<Stack gap={4} style={{ minWidth: 0 }}>
						<Text size='md' fw={700} lineClamp={2}>{productName}</Text>
						<OrderItemMetaLine item={item} />
					</Stack>
				</Group>
				<Group gap='md' align='center' wrap='nowrap' style={{ flexShrink: 0 }}>
					<Box
						px='md'
						py='xs'
						style={{
							border: '1px solid var(--mantine-color-gray-3)',
							borderRadius: 9999,
							background: 'var(--mantine-color-body)',
						}}
					>
						<Text size='sm' c='dimmed' style={{ whiteSpace: 'nowrap' }}>
							{item.quantity}
							{' × '}
							{unit}
						</Text>
					</Box>
					<Text size='md' fw={600} style={{ whiteSpace: 'nowrap' }}>{lineTotal}</Text>
				</Group>
			</Group>
		</Paper>
	);
};

export function OrderItemLineList({ order }: { order: VdOrder }) {
	const { t: translate } = useTranslation('vending_machine');
	const items = order.items ?? [];
	if (items.length === 0) {
		return <Text c='dimmed' size='sm'>{translate('orders.items.empty')}</Text>;
	}
	return (
		<Stack gap='md'>
			{items.map((it) => (
				<OrderItemLineCard
					key={it.id}
					item={it}
					currency={order.currency as VdOrderCurrency}
				/>
			))}
		</Stack>
	);
}
