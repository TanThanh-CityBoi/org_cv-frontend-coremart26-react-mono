/* eslint-disable max-lines-per-function */
import {
	Box, Button, Group, Image, Modal, NumberInput, Stack, Text, Title, Divider,
} from '@mantine/core';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocalizedName } from '@/common/helpers';
import { MOCK_EVENT_STOCK_CREATE_PRODUCTS } from '@/features/events/mocks/mockEventStockCreateProducts';

import type { EventStockUpdateFormPayload } from '@/features/events/hooks/useEventStockUpdate';
import type { EventStock } from '@/features/events/types';



function parseNonNegativeInt(raw: string | number | undefined): number {
	if (raw === '' || raw == null) {
		return 0;
	}
	const n = Number(String(raw).replace(/\s/g, ''));
	if (!Number.isFinite(n) || n < 0) {
		return 0;
	}
	return Math.floor(n);
}

export type EventStockEditModalProps = {
	opened: boolean;
	stock: EventStock | null;
	lang: string;
	onClose: () => void;
	onSubmit: (p: EventStockUpdateFormPayload) => void;
	isSubmitting: boolean;
};

export const EventStockEditModal: React.FC<EventStockEditModalProps> = ({
	opened, stock, lang, onClose, onSubmit, isSubmitting,
}) => {
	const { t: translate } = useTranslation();
	const [sellPrice, setSellPrice] = useState(0);

	useEffect(() => {
		if (!stock) {
			return;
		}
		setSellPrice(parseNonNegativeInt(stock.sellPrice));
	}, [stock?.id, stock?.sellPrice]);

	if (!stock) {
		return null;
	}

	const catalog = MOCK_EVENT_STOCK_CREATE_PRODUCTS.find((p) => p.id === stock.productRef);
	const nameDisplay = catalog ? getLocalizedName(catalog.name, lang) : '—';
	const sku = catalog?.sku ?? stock.productRef;
	const proposed = catalog?.proposedPrice;
	const priceDisplay = proposed == null || proposed === ''
		? '—'
		: parseNonNegativeInt(proposed).toLocaleString('vi-VN') + ' đ';

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={translate('coremart.vendingMachine.events.eventStock.edit.title', {
				defaultValue: 'Event product line',
			})}
			centered
			size='lg'
		>
			<Stack gap='md'>
				<Group align='flex-start' justify='center' gap='md' wrap='wrap'>
					<Box w={200} h={220} bg='gray.0'>
						<Image
							alt=''
							w='100%'
							h='100%'
							fit='contain'
							radius='sm'
							src={catalog?.imageUrl || blankPicture}
							onError={(e) => {
								(e.target as HTMLImageElement).src = blankPicture;
							}}
						/>
					</Box>
					<Stack gap='xs' style={{ flex: 1, minWidth: 0 }} miw={200}>
						<Box>
							<Title lineClamp={2} order={5}>{nameDisplay}</Title>
							<Text lineClamp={2} size='sm' c='dimmed'>SKU: {sku}</Text>
						</Box>
						<Divider />
						<Stack gap={3}>
							<Text size='sm' c='dimmed'>
								{translate('coremart.vendingMachine.kiosk.stocks.fields.proposedPrice', {
									defaultValue: 'Reference price',
								})}
							</Text>
							<Text size='sm'>{priceDisplay}</Text>
						</Stack>
					</Stack>
				</Group>
				<NumberInput
					label={translate('coremart.vendingMachine.kiosk.stocks.fields.sellPrice', {
						defaultValue: 'Sell price',
					})}
					value={sellPrice}
					onChange={(v) => setSellPrice(typeof v === 'number' ? v : parseNonNegativeInt(String(v)))}
					min={0}
					decimalScale={0}
					allowDecimal={false}
					thousandSeparator=' '
					suffix=' đ'
				/>
				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={onClose} disabled={isSubmitting}>
						{translate('nikki.general.actions.cancel', { defaultValue: 'Cancel' })}
					</Button>
					<Button loading={isSubmitting} onClick={() => onSubmit({ sellPrice })}>
						{translate('nikki.general.actions.save', { defaultValue: 'Save' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
