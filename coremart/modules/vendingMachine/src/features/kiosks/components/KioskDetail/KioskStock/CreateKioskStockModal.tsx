/* eslint-disable max-lines-per-function */
import {
	Button, Center, Group, Image, Modal, NumberInput, Paper, ScrollArea, SimpleGrid, Stack, Text,
} from '@mantine/core';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import { IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getLocalizedName } from '@/common/helpers';
import { ControlPanel, ViewMode } from '@/components/ControlPanel';
import { useAvailableProductForKiosk } from '@/features/kioskProducts';
import { KioskProductList } from '@/features/kioskProducts/components/KioskProductList';
import { useKioskProductFilter } from '@/features/kioskProducts/hooks/useKioskProductList';
import { Kiosk } from '@/features/kiosks';


import { DEFAULT_STOCK_WARNING_QUANTITY } from './KioskStockEditModal';

import type { KioskProduct } from '@/features/kioskProducts/type';
import type { CreateKioskStockFormPayload } from '@/features/kiosks/hooks/useCreateKioskStock';


function sellPriceFromProposedPrice(proposed: string | undefined): number {
	if (proposed == null || proposed === '') {
		return 0;
	}
	const n = Number(String(proposed).replace(/\s/g, ''));
	if (!Number.isFinite(n) || n < 0) {
		return 0;
	}
	return Math.floor(n);
}

const DEFAULT_SORT = 1;

type StockLineDraft = {
	sellPrice: number | string;
	sortIndex: number | string;
	warningQuantity?: number | string;
};

type SelectedProductsProps = {
	selectedProducts: KioskProduct[];
	lineByProductId: Record<string, StockLineDraft>;
	setLineSellPrice: (productId: string, value: number | string) => void;
	setLineSortIndex: (productId: string, value: number | string) => void;
	setLineWarningQuantity: (productId: string, value: number | string) => void;
	emptyHint?: string;
	scrollMaxHeight?: number;
};

function SlideExpose({ children }: React.PropsWithChildren) {
	return (
		<div
			style={{ overflow: 'hidden', scrollBehavior: 'auto', minHeight: 480 }}
			onScroll={(e) => {
				e.currentTarget.scrollLeft = 0;
			}}
			className='relative w-full'
		>
			{children}
		</div>
	);
}

type SlideStripProps = React.PropsWithChildren<{ slideIndex: number }>;

function SlideStrip({ slideIndex, children }: SlideStripProps): React.ReactNode {
	const panes = React.Children.toArray(children);
	const count = Math.max(panes.length, 1);
	return (
		<div
			className='flex transition-transform duration-300 ease-in-out'
			style={{
				width: `${count * 100}%`,
				transform: `translateX(-${slideIndex * (100 / count)}%)`,
				willChange: 'transform',
			}}
		>
			{panes.map((pane, index) => (
				<div
					key={index}
					className='flex-shrink-0'
					style={{
						width: `${100 / count}%`,
						pointerEvents: index === slideIndex ? 'auto' : 'none',
					}}
				>
					{pane}
				</div>
			))}
		</div>
	);
}

const SelectedProducts: React.FC<SelectedProductsProps> = ({
	selectedProducts,
	lineByProductId,
	setLineSellPrice,
	setLineWarningQuantity,
	emptyHint,
	scrollMaxHeight = 360,
}) => {
	const { t, i18n } = useTranslation();
	if (selectedProducts.length === 0) {
		return (
			<Center h={scrollMaxHeight}>
				<Text size='sm' c='dimmed'>
					{emptyHint ??
						t('coremart.vendingMachine.kioskStock.create.noneSelected', {
							defaultValue: 'Pick one or more products above to set price and display order.',
						})}
				</Text>
			</Center>
		);
	}
	return (
		<ScrollArea.Autosize mah={scrollMaxHeight} type='auto' offsetScrollbars>
			<Stack gap='sm'>
				{selectedProducts.map((product) => {
					const line = lineByProductId[product.id];
					const displayName = getLocalizedName(product.name, i18n.language);
					return (
						<Paper key={product.id} withBorder p='xs' radius='md'>
							<Group align='flex-start' wrap='nowrap' gap='md'>
								<Image
									alt='' w={56} h={56}
									radius='sm'
									fit='cover'
									src={product.imageUrl || blankPicture}
									onError={(e) => {
										(e.target as HTMLImageElement).src = blankPicture;
									}}
								/>
								<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
									<Text size='sm' fw={500} lineClamp={2}>{displayName}</Text>
									<Text size='xs' c='dimmed' lineClamp={1}>{product.sku}</Text>
								</Stack>
								<SimpleGrid cols={2} spacing='xs' style={{ flex: '1 1 220px' }}>
									<NumberInput
										label={t('coremart.vendingMachine.kiosk.stocks.fields.sellPrice', {
											defaultValue: 'Giá bán',
										})}
										size='xs'
										min={0}
										allowDecimal={false}
										value={line?.sellPrice ?? 0}
										onChange={(v) => setLineSellPrice(product.id, v)}
										thousandSeparator=' '
										suffix=' đ'
										required
									/>
									<NumberInput
										label={t('coremart.vendingMachine.kiosk.stocks.fields.warningQuantity', {
											defaultValue: 'Số lượng cảnh báo',
										})}
										size='xs'
										min={0}
										allowDecimal={false}
										value={line?.warningQuantity ?? DEFAULT_STOCK_WARNING_QUANTITY}
										onChange={(v) => setLineWarningQuantity(product.id, v)}
									/>
								</SimpleGrid>
							</Group>
						</Paper>
					);
				})}
			</Stack>
		</ScrollArea.Autosize>
	);
};


export type CreateKioskStockModalProps = {
	opened: boolean;
	onClose: () => void;
	onSubmit: (payloads: CreateKioskStockFormPayload[]) => void;
	isSubmitting: boolean;
	kiosk: Kiosk;
};

function useBulkCreateKioskStocks(
	opened: boolean,
	onSubmit: (payloads: CreateKioskStockFormPayload[]) => void,
) {
	const [selectedProducts, setSelectedProducts] = useState<KioskProduct[]>([]);
	const [lineByProductId, setLineByProductId] = useState<Record<string, StockLineDraft>>({});

	useEffect(() => {
		if (!opened) {
			return;
		}
		setSelectedProducts([]);
		setLineByProductId({});
	}, [opened]);

	useEffect(() => {
		setLineByProductId((prev) => {
			const next: Record<string, StockLineDraft> = {};
			for (const product of selectedProducts) {
				const kept = prev[product.id];
				next[product.id] = kept ?? {
					sellPrice: sellPriceFromProposedPrice(product.proposedPrice),
					sortIndex: DEFAULT_SORT,
					warningQuantity: DEFAULT_STOCK_WARNING_QUANTITY,
				};
			}
			return next;
		});
	}, [selectedProducts]);

	const setLineSellPrice = useCallback((productId: string, value: number | string) => {
		setLineByProductId((prev) => ({
			...prev,
			[productId]: {
				sellPrice: value,
				sortIndex: prev[productId]?.sortIndex ?? DEFAULT_SORT,
				warningQuantity: prev[productId]?.warningQuantity ?? DEFAULT_STOCK_WARNING_QUANTITY,
			},
		}));
	}, []);

	const setLineSortIndex = useCallback((productId: string, value: number | string) => {
		setLineByProductId((prev) => ({
			...prev,
			[productId]: {
				sellPrice: prev[productId]?.sellPrice ?? 0,
				sortIndex: value,
				warningQuantity: prev[productId]?.warningQuantity ?? DEFAULT_STOCK_WARNING_QUANTITY,
			},
		}));
	}, []);

	const setLineWarningQuantity = useCallback((productId: string, value: number | string) => {
		setLineByProductId((prev) => ({
			...prev,
			[productId]: {
				sellPrice: prev[productId]?.sellPrice ?? 0,
				sortIndex: prev[productId]?.sortIndex ?? DEFAULT_SORT,
				warningQuantity: value,
			},
		}));
	}, []);

	const onSave = useCallback(() => {
		if (selectedProducts.length === 0) {
			return;
		}
		const payloads: CreateKioskStockFormPayload[] = [];
		for (const product of selectedProducts) {
			const line = lineByProductId[product.id];
			if (!line) {
				continue;
			}
			const price = Number(line.sellPrice);
			const sort = Math.max(0, Math.floor(Number(line.sortIndex)));
			if (Number.isNaN(price) || price < 0) {
				return;
			}
			payloads.push({
				productRef: product.id,
				sortIndex: sort,
				sellPrice: price,
				warningQuantity: Number(line.warningQuantity),
			});
		}
		if (payloads.length === 0) {
			return;
		}
		onSubmit(payloads);
	}, [selectedProducts, lineByProductId, onSubmit]);

	return {
		selectedProducts,
		setSelectedProducts,
		lineByProductId,
		setLineSellPrice,
		setLineSortIndex,
		setLineWarningQuantity,
		onSave,
	};
}

export const CreateKioskStockModal: React.FC<CreateKioskStockModalProps> = ({
	opened, onClose, onSubmit, isSubmitting, kiosk,
}) => {
	const { t } = useTranslation();
	const {
		selectedProducts,
		setSelectedProducts,
		lineByProductId,
		setLineSellPrice,
		setLineSortIndex,
		setLineWarningQuantity,
		onSave,
	} = useBulkCreateKioskStocks(opened, onSubmit);

	const [slideIndex, setSlideIndex] = useState(0);
	const goToBrowse = useCallback(() => setSlideIndex(0), []);
	const goToSelected = useCallback(() => setSlideIndex(1), []);

	const { filters, graph } = useKioskProductFilter();
	const { products, pagination, handleRefresh, listError } = useAvailableProductForKiosk(kiosk?.id, graph);

	const viewSelectedLabel = useMemo(() => {
		const base = t('coremart.vendingMachine.kiosk.stocks.create.viewSelected', {
			defaultValue: 'View selected',
		});
		return selectedProducts.length > 0 ? `${base} (${selectedProducts.length})` : base;
	}, [t, selectedProducts.length]);

	const controlActions = useMemo(
		() => [
			{
				label: viewSelectedLabel,
				leftSection: <IconChevronRight size={16} />,
				onClick: goToSelected,
				variant: 'outline' as const,
			},
			{
				label: t('nikki.general.actions.refresh'),
				leftSection: <IconRefresh size={16} />,
				onClick: handleRefresh,
				variant: 'outline' as const,
			},
		],
		[goToSelected, handleRefresh, t, viewSelectedLabel],
	);

	const [viewMode, setViewMode] = useState<ViewMode>('list');

	useEffect(() => {
		if (!opened) {
			return;
		}
		handleRefresh();
		setSelectedProducts([]);
		setSlideIndex(0);
	}, [opened]);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('coremart.vendingMachine.kiosk.stocks.create.title', {
				defaultValue: 'Add product to kiosk',
			})}
			centered
			size='xl'
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<SlideExpose>
					<SlideStrip slideIndex={slideIndex}>
						<Stack gap='md'>
							<ControlPanel
								actions={controlActions}
								filters={filters}
								viewMode={{
									value: viewMode,
									onChange: setViewMode,
									segments: ['grid', 'list'],
								}}
							/>
							<KioskProductList
								multiSelect
								products={products}
								pagination={pagination}
								viewMode={viewMode}
								error={listError}
								selectedProducts={selectedProducts}
								onSelectProductsChange={setSelectedProducts}
							/>
						</Stack>
						<Stack gap='md'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								w={'max-content'}
								fw={500}
								leftSection={<IconChevronLeft size={16} />}
								onClick={goToBrowse}
							>
								{t('coremart.vendingMachine.kiosk.stocks.create.backToBrowse', {
									defaultValue: 'Back to product list',
								})}
							</Button>
							<SelectedProducts
								selectedProducts={selectedProducts}
								lineByProductId={lineByProductId}
								setLineSellPrice={setLineSellPrice}
								setLineSortIndex={setLineSortIndex}
								setLineWarningQuantity={setLineWarningQuantity}
								scrollMaxHeight={380}
								emptyHint={
									t('coremart.vendingMachine.kiosk.stocks.create.noneSelectedSlide', {
										defaultValue:
											'Nothing selected yet. Go back and pick products to set sell price and display order.',
									})
								}
							/>
						</Stack>
					</SlideStrip>
				</SlideExpose>
				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={onClose} disabled={isSubmitting}>
						{t('nikki.general.actions.cancel')}
					</Button>
					<Button
						loading={isSubmitting}
						disabled={selectedProducts.length === 0}
						onClick={onSave}
					>
						{t('nikki.general.actions.add', { defaultValue: 'Add' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
