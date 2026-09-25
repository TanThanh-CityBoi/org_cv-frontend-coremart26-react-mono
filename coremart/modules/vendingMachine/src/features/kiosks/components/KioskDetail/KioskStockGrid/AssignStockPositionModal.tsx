/* eslint-disable max-lines-per-function */
import {
	Button, Card, Group, Image, Modal, NumberInput, ScrollArea, SimpleGrid, Stack, Text, Title,
} from '@mantine/core';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import { useCallback, useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';


import { buildCellItemFromKioskStock } from './kioskStock.helpers';
import { getLocalizedName } from '../../../../../common/helpers';


import type { CellStockItem, KioskStock, KioskStockRow } from './kioskStock.types';


const DEFAULT_QUANTITY = 5;
const DEFAULT_MAX = 5;

export type AssignStockPositionModalProps = {
	opened: boolean,
	onClose: () => void,
	/** Kiosk shelf row (e.g. A). */
	row: KioskStockRow,
	/** Column as string (e.g. "1"). */
	col: string,
	stocks: KioskStock[],
	/** When user confirms selection + quantities. */
	onAssign: (cell: CellStockItem) => void,
};

export const AssignStockPositionModal: FC<AssignStockPositionModalProps> = (props) => {
	const { opened, onClose, row, col, stocks, onAssign } = props;
	const { t, i18n } = useTranslation('vending_machine');

	const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);
	const [maxQuantity, setMaxQuantity] = useState(DEFAULT_MAX);

	useEffect(() => {
		if (opened) {
			setSelectedStockId(null);
			setQuantity(DEFAULT_QUANTITY);
			setMaxQuantity(DEFAULT_MAX);
		}
	}, [opened]);

	useEffect(() => {
		setQuantity((q) => Math.min(q, maxQuantity));
	}, [maxQuantity]);

	const handleSubmit = useCallback(() => {
		if (!selectedStockId) {
			return;
		}
		const stock = stocks.find((s) => s.id === selectedStockId);
		if (!stock) {
			return;
		}
		const maxV = Math.max(0, maxQuantity);
		const q = Math.min(Math.max(0, quantity), maxV);
		const cell = buildCellItemFromKioskStock(stock, String(row), col, q, maxV);
		onAssign(cell);
		onClose();
	}, [col, maxQuantity, onAssign, onClose, quantity, row, selectedStockId, stocks]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('kiosk.stocks.assign.title', { defaultValue: 'Assign stock to cell' })}
			centered
			size='xl'
		>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					{row}{col} — {t('kiosk.stocks.assign.hint',
						{ defaultValue: 'Select a line, set quantities, then assign.' })}
				</Text>
				<ScrollArea h={360} type='auto'>
					{stocks.length === 0 ? (
						<Text c='dimmed' ta='center' py='xl'>
							{t('kiosk.stocks.assign.empty', { defaultValue: 'No kiosk stock lines available.' })}
						</Text>
					) : (
						<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
							{stocks.map((stock) => {
								const p = stock.product;
								const title = p ? getLocalizedName(p.name, i18n.language) : (stock.id ?? '—');
								const isSel = selectedStockId === stock.id;
								return (
									<Card
										key={stock.id}
										padding='md'
										withBorder
										radius='md'
										role='button'
										tabIndex={0}
										onClick={() => setSelectedStockId(stock.id)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												setSelectedStockId(stock.id);
											}
										}}
										styles={(theme) => ({
											root: {
												borderColor: isSel ? theme.colors.blue[6] : undefined,
												borderWidth: isSel ? 2 : 1,
												boxShadow: isSel ? theme.shadows.sm : 'none',
											},
										})}
									>
										<Stack gap='xs' align='center'>
											<Image
												alt=''
												w={64}
												h={64}
												fit='cover'
												radius='sm'
												src={p?.imageUrl || blankPicture}
												onError={(e) => {
													(e.target as HTMLImageElement).src = blankPicture;
												}}
											/>
											<Title order={6} lineClamp={2} ta='center'>{title}</Title>
											<Text size='xs' c='dimmed' lineClamp={1}>
												{p?.sku ?? '—'}
											</Text>
										</Stack>
									</Card>
								);
							})}
						</SimpleGrid>
					)}
				</ScrollArea>
				<Group grow align='flex-end'>
					<NumberInput
						label={t('kiosk.stocks.fields.quantity', { defaultValue: 'Quantity' })}
						min={0}
						max={maxQuantity}
						value={quantity}
						onChange={(v) => setQuantity(typeof v === 'number' ? v : 0)}
					/>
					<NumberInput
						label={t('kiosk.stocks.fields.max_quantity', { defaultValue: 'Max quantity' })}
						min={0}
						value={maxQuantity}
						onChange={(v) => {
							const n = typeof v === 'number' ? v : 0;
							setMaxQuantity(n);
						}}
					/>
				</Group>
				<Group justify='flex-end' gap='sm' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('action.cancel', { defaultValue: 'Cancel' })}
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedStockId}
					>
						{t('action.add', { defaultValue: 'Assign' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
