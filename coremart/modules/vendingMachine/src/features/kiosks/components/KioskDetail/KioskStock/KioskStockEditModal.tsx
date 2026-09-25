/* eslint-disable max-lines-per-function */
import {
	ActionIcon, Box, Button, Group, Image, Modal, NumberInput, SimpleGrid, Stack, Text,
	Title, Divider,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import { IconCloudUpload, IconPhoto, IconTrash } from '@tabler/icons-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocalizedName } from '@/common/helpers';
import { KioskStockUpdateFormPayload } from '@/features/kiosks/hooks/useKioskStockUpdate';

import {
	formatKioskStockPositionsDisplay, totalQuantityForKioskStock,
} from '../KioskStockGrid/kioskStock.helpers';
import { KioskStock } from '../KioskStockGrid/kioskStock.types';


export const DEFAULT_STOCK_WARNING_QUANTITY = 5;


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

const BADGE_MAX_BYTES = 10 * 1024 * 1024;

function useObjectPreviewUrlForFile(file: File | null): string | null {
	const [url, setUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!file) {
			setUrl(null);
			return undefined;
		}
		const u = URL.createObjectURL(file);
		setUrl(u);
		return () => URL.revokeObjectURL(u);
	}, [file]);
	return url;
}

type KioskStockBadgeImageUploadProps = {
	label: string;
	hint?: string;
	browseLabel: string;
	acceptLabel: string;
	rejectLabel: string;
	emptyFileLabel: string;
	file: File | null;
	onFileChange: (f: File | null) => void;
};

const KioskStockBadgeImageUpload: React.FC<KioskStockBadgeImageUploadProps> = ({
	label, hint, browseLabel, acceptLabel, rejectLabel, emptyFileLabel, file, onFileChange,
}) => {
	const previewUrl = useObjectPreviewUrlForFile(file);
	const zoneText = (body: string) => (
		<Stack align='center' justify='center' gap='sm' mih={120} style={{ pointerEvents: 'none' }}>
			<Box
				style={{
					width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
					background: 'var(--mantine-color-blue-0)',
					border: '1px solid var(--mantine-color-blue-2)',
				}}
			>
				<IconCloudUpload size={32} color='var(--mantine-color-blue-6)' stroke={1.5} />
			</Box>
			<Text size='sm' c='gray.7' ta='center' fw={500} maw='90%'>
				{body}
			</Text>
		</Stack>
	);
	return (
		<Stack gap='xs' w='100%'>
			<Stack gap={2}>
				<Text size='sm' fw={500}>
					{label}
				</Text>
				{hint && <Text size='xs' c='dimmed'>
					{hint}
				</Text>}
			</Stack>
			<Dropzone
				onDrop={(files) => onFileChange(files[0] ?? null)}
				maxFiles={1}
				maxSize={BADGE_MAX_BYTES}
				accept={IMAGE_MIME_TYPE}
				styles={{
					root: {
						border: '2px dashed var(--mantine-color-blue-4)',
						backgroundColor: 'var(--mantine-color-body)',
						borderRadius: 'var(--mantine-radius-md)',
						boxShadow: '0 0 0 1px rgba(34, 139, 230, 0.12), 0 4px 14px rgba(34, 139, 230, 0.08)',
					},
				}}
			>
				<Dropzone.Accept>
					{zoneText(acceptLabel)}
				</Dropzone.Accept>
				<Dropzone.Reject>
					<Stack align='center' justify='center' gap='sm' mih={120} style={{ pointerEvents: 'none' }}>
						<Box
							style={{
								width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
								background: 'var(--mantine-color-red-0)',
							}}
						>
							<IconCloudUpload size={32} color='var(--mantine-color-red-6)' stroke={1.5} />
						</Box>
						<Text size='sm' c='red.7' ta='center' fw={500} maw='90%'>
							{rejectLabel}
						</Text>
					</Stack>
				</Dropzone.Reject>
				<Dropzone.Idle>
					{zoneText(browseLabel)}
				</Dropzone.Idle>
			</Dropzone>
			<Group
				wrap='nowrap'
				gap='sm'
				px='md'
				py='sm'
				style={{
					background: 'var(--mantine-color-blue-0)',
					borderRadius: 9999,
					border: '1px solid var(--mantine-color-blue-1)',
				}}
			>
				<Box
					w={40}
					h={40}
					style={{
						borderRadius: 8,
						overflow: 'hidden',
						flexShrink: 0,
						background: 'var(--mantine-color-gray-1)',
					}}
				>
					{previewUrl ? (
						<Image src={previewUrl} alt='' w={40} h={40} fit='cover' />
					) : (
						<Box
							w='100%'
							h='100%'
							style={{
								display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mantine-color-blue-1)',
							}}
						>
							<IconPhoto size={22} color='var(--mantine-color-blue-6)' stroke={1.5} />
						</Box>
					)}
				</Box>
				<Text
					size='sm'
					c='gray.7'
					lineClamp={1}
					style={{ flex: 1, minWidth: 0 }}
				>
					{file ? file.name : emptyFileLabel}
				</Text>
				<ActionIcon
					variant='subtle'
					color='gray'
					aria-label='Clear'
					onClick={() => onFileChange(null)}
					disabled={!file}
					style={{ flexShrink: 0, opacity: file ? 1 : 0.4 }}
				>
					<IconTrash size={18} />
				</ActionIcon>
			</Group>
		</Stack>
	);
};

export type KioskStockEditModalProps = {
	opened: boolean;
	stock: KioskStock | null;
	lang: string;
	onClose: () => void;
	onSubmit: (p: KioskStockUpdateFormPayload) => void;
	isSubmitting: boolean;
};

export const KioskStockEditModal: React.FC<KioskStockEditModalProps> = ({
	opened, stock, lang, onClose, onSubmit, isSubmitting,
}) => {
	const { t: translate } = useTranslation();
	const [sortIndex, setSortIndex] = useState(0);
	const [sellPrice, setSellPrice] = useState(0);
	const [warningQuantity, setWarningQuantity] = useState(0);
	/** Local file only; PUT body does not include badge (Bruno Kiosk Stock - Update). */
	const [badgeFile, setBadgeFile] = useState<File | null>(null);
	const clearBadgeFile = useCallback(() => {
		setBadgeFile(null);
	}, []);

	useEffect(() => {
		if (!stock) {
			return;
		}
		setSortIndex(stock.sortIndex ?? 0);
		setSellPrice(parseNonNegativeInt(stock.sellPrice));
		setWarningQuantity(stock.warningQuantity ?? DEFAULT_STOCK_WARNING_QUANTITY);
		clearBadgeFile();
	}, [clearBadgeFile, stock?.id]);

	if (!stock) {
		return null;
	}

	const product = stock.product;
	const nameDisplay = getLocalizedName(product?.name, lang);
	const originalPrice = product?.proposedPrice;
	const priceDisplay = originalPrice == null || originalPrice === ''
		? '—'
		: parseNonNegativeInt(originalPrice).toLocaleString('vi-VN') + ' đ';
	const totalQty = totalQuantityForKioskStock(stock);
	const positions = formatKioskStockPositionsDisplay(stock);


	if (!product) {
		return null;
	}

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={translate('coremart.vendingMachine.kiosk.stocks.edit.title', { defaultValue: 'Product line' })}
			centered
			size='lg'
		>
			<Stack gap='md'>
				<Group align='flex-start' justify='center' gap='md' wrap='wrap'>
					<Box w={200} h={220} bg='gray.0'>
						<Image
							alt=''
							w={'100%'}
							h={'100%'}
							fit='contain'
							radius='sm'
							src={product?.imageUrl || blankPicture}
							onError={(e) => {
								(e.target as HTMLImageElement).src = blankPicture;
							}}
						/>
					</Box>
					<Stack gap='xs' style={{ flex: 1, minWidth: 0 }} miw={200}>
						<Box>
							<Title lineClamp={2} order={5}>{nameDisplay || '—'}</Title>
							<Text lineClamp={2} size='sm' c='dimmed'>SKU: {product?.sku || '—'}</Text>
						</Box>
						<Divider />
						<Stack gap={3}>
							<Text size='sm' c='dimmed'>{translate('coremart.vendingMachine.kiosk.stocks.fields.proposedPrice', { defaultValue: 'Sell price' })}</Text>
							<Text size='sm'>{priceDisplay}</Text>
							<Text size='sm' c='dimmed'>{translate('coremart.vendingMachine.kiosk.stocks.fields.quantity', { defaultValue: 'Quantity in machine' })}</Text>
							<Text size='sm'>{totalQty}</Text>
							<Text size='sm' c='dimmed'>{translate('coremart.vendingMachine.kiosk.stocks.fields.positions', { defaultValue: 'Positions' })}</Text>
							<Text size='sm'>{positions}</Text>
						</Stack>
					</Stack>
				</Group>
				<KioskStockBadgeImageUpload
					label={translate('coremart.vendingMachine.kiosk.stocks.fields.badgeImage', {
						defaultValue: 'Badge image',
					})}
					browseLabel={translate('coremart.vendingMachine.kioskStock.edit.badge_browse', {
						defaultValue: 'Browse Files to upload',
					})}
					acceptLabel={translate('coremart.vendingMachine.kioskStock.edit.badge_drop_accept', {
						defaultValue: 'Drop file here',
					})}
					rejectLabel={translate('coremart.vendingMachine.kioskStock.edit.badge_drop_reject', {
						defaultValue: 'File type or size is not valid',
					})}
					emptyFileLabel={translate('coremart.vendingMachine.kioskStock.edit.badge_no_file', {
						defaultValue: 'No selected File -',
					})}
					file={badgeFile}
					onFileChange={setBadgeFile}
				/>
				<SimpleGrid cols={3} spacing='md'>
					<NumberInput
						label={translate('coremart.vendingMachine.kiosk.stocks.fields.sellPrice', { defaultValue: 'Sell price' })}
						value={sellPrice}
						onChange={(v) => setSellPrice(typeof v === 'number' ? v : parseNonNegativeInt(String(v)))}
						min={0}
						decimalScale={0}
						allowDecimal={false}
					/>
					<NumberInput
						label={translate('coremart.vendingMachine.kiosk.stocks.fields.warningQuantity', {
							defaultValue: 'Warning quantity',
						})}
						value={warningQuantity}
						onChange={(v) => setWarningQuantity(typeof v === 'number' ? v : parseNonNegativeInt(String(v)))}
						min={0}
						decimalScale={0}
						allowDecimal={false}
					/>
					<NumberInput
						label={translate('coremart.vendingMachine.kiosk.stocks.fields.sortIndex', {
							defaultValue: 'Display order',
						})}
						value={sortIndex}
						onChange={(v) => setSortIndex(typeof v === 'number' ? v : parseNonNegativeInt(String(v)))}
						min={0}
						decimalScale={0}
						allowDecimal={false}
					/>
				</SimpleGrid>
				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={onClose} disabled={isSubmitting}>
						{translate('nikki.general.actions.cancel', { defaultValue: 'Cancel' })}
					</Button>
					<Button
						loading={isSubmitting}
						onClick={() => onSubmit({ sortIndex, sellPrice, warningQuantity })}
					>
						{translate('nikki.general.actions.save', { defaultValue: 'Save' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
