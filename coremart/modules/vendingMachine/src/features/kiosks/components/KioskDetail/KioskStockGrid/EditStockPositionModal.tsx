import {
	Box,
	Button, Group, Image, Modal, NumberInput, Stack, Switch, Text, Title,
} from '@mantine/core';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import { useCallback, useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocalizedName } from '../../../../../common/helpers';

import type { CellStockItem } from './kioskStock.types';


export type EditStockPositionModalProps = {
	opened: boolean,
	onClose: () => void,
	/** Renders form when true; when false, position fields are read-only. */
	canEditPosition: boolean,
	row: string,
	col: string,
	cell: CellStockItem | null,
	onSave: (cell: CellStockItem) => void,
};

// eslint-disable-next-line max-lines-per-function
export const EditStockPositionModal: FC<EditStockPositionModalProps> = (props) => {
	const {opened, onClose, canEditPosition, cell, row, col, onSave} = props;
	const { t, i18n } = useTranslation('vending_machine');

	const [quantity, setQuantity] = useState(0);
	const [maxQuantity, setMaxQuantity] = useState(0);
	const [isEnabled, setIsEnabled] = useState(true);

	const resetForm = useCallback(() => {
		if (!cell) {
			return;
		}
		setQuantity(Number(cell.quantity) || 0);
		setMaxQuantity(Number(cell.maxQuantity) || 0);
		setIsEnabled(cell.isEnabled);
	}, [cell]);

	useEffect(() => {
		if (opened) {
			resetForm();
		}
	}, [opened, cell, resetForm]);

	const handleSave = useCallback(() => {
		if (!cell) {
			return;
		}
		const next: CellStockItem = {
			...cell,
			quantity: Math.max(0, Math.min(quantity, maxQuantity)),
			maxQuantity: Math.max(0, maxQuantity),
			isEnabled,
		};
		if (maxQuantity < 0) {
			return;
		}
		onSave(next);
		onClose();
	}, [cell, maxQuantity, isEnabled, onClose, onSave, quantity]);

	const nameStr = cell ? getLocalizedName(cell.name, i18n.language) : '';

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={`Cell ${row}:${col}`}
			centered
			size='lg'
		>
			{!cell ? (
				<Stack gap='md'>
					<Text c='dimmed'>{t('kiosk_stock.cell_detail.empty', { defaultValue: 'No stock in this cell.' })}</Text>
					<Text size='sm'>{row}{col}</Text>
					<Group justify='flex-end'>
						<Button variant='default' onClick={onClose}>{t('action.close')}</Button>
					</Group>
				</Stack>
			) : (
				<Stack gap='md'>
					<Group align='flex-start' justify='center' gap='md' wrap='wrap'>
						<Box w={200} h={220} bg='gray.0'>
							<Image
								alt=''
								w={'100%'}
								h={'100%'}
								fit='contain'
								radius='sm'
								src={cell.imageUrl || blankPicture}
								onError={(e) => {
									(e.target as HTMLImageElement).src = blankPicture;
								}}
							/>
						</Box>
						<Stack gap='xs' style={{ flex: 1, minWidth: 0 }} miw={200}>
							<Box>
								<Title lineClamp={2} order={5}>{nameStr || '—'}</Title>
								<Text lineClamp={2} size='sm' c='dimmed'>SKU: {cell.sku || '—'}</Text>
							</Box>
							<Switch
								label={t('kiosk.stocks.fields.is_enabled', { defaultValue: 'Enabled' })}
								checked={isEnabled}
								onChange={(e) => setIsEnabled(e.currentTarget.checked)}
								disabled={!canEditPosition}
							/>

							<NumberInput
								label={t('kiosk.stocks.fields.quantity', { defaultValue: 'Quantity' })}
								min={0}
								max={maxQuantity}
								value={quantity}
								onChange={(v) => setQuantity(typeof v === 'number' ? v : 0)}
								readOnly={!canEditPosition}
							/>
							<NumberInput
								label={t('kiosk.stocks.fields.max_quantity', { defaultValue: 'Max quantity' })}
								min={0}
								value={maxQuantity}
								onChange={(v) => setMaxQuantity(typeof v === 'number' ? v : 0)}
								readOnly={!canEditPosition}
							/>
						</Stack>
					</Group>

					<Group justify='flex-end' gap='sm' mt='md'>
						<Button variant='default' onClick={onClose}>
							{t('action.cancel', { defaultValue: 'Cancel' })}
						</Button>
						<Button onClick={handleSave} disabled={!canEditPosition}>
							{t('action.save', { defaultValue: 'Save' })}
						</Button>
					</Group>
				</Stack>
			)}
		</Modal>
	);
};
