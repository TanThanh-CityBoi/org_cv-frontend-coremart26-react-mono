/* eslint-disable max-lines-per-function */
import {
	Button, Center, Group, Image, Modal, NumberInput, Paper, ScrollArea, Stack, Text,
} from '@mantine/core';
import blankPicture from '@nikkierp/ui/assets/images/blank-picture.png';
import { IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Event } from '../../..';
import { getLocalizedName } from '../../../../../common/helpers';
import { ControlPanel, ViewMode } from '../../../../../components/ControlPanel';
import { KioskProductList } from '../../../../kioskProducts/components/KioskProductList';
import { useKioskProductFilter } from '../../../../kioskProducts/hooks/useKioskProductList';
import { sellPriceFromProposedPrice } from '../../../../kioskProducts/sellPrice';
import { useAvailableProductForEvent } from '../../../hooks';

import type { KioskProduct } from '../../../../kioskProducts/type';
import type { CreateEventStockFormPayload } from '../../../hooks/useCreateEventStock';


type StockLineDraft = {
	sellPrice: number | string,
};

type SelectedProductsProps = {
	selectedProducts: KioskProduct[],
	lineByProductId: Record<string, StockLineDraft>,
	setLineSellPrice: (productId: string, value: number | string) => void,
	/** When set (e.g. second slide), overrides default empty helper text */
	emptyHint?: string,
	scrollMaxHeight?: number,
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
	emptyHint,
	scrollMaxHeight = 360,
}) => {
	const { t, i18n } = useTranslation('vending_machine');
	if (selectedProducts.length === 0) {
		return (
			<Center h={scrollMaxHeight}>
				<Text size='sm' c='dimmed'>
					{emptyHint ??
					t('event_stock.create.none_selected', {
						defaultValue: 'Pick one or more products above to set price.',
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
								<NumberInput
									label={t('kiosk.stocks.fields.sell_price', {
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
									style={{ flex: '1 1 160px' }}
								/>
							</Group>
						</Paper>
					);
				})}
			</Stack>
		</ScrollArea.Autosize>
	);
};


export type CreateEventStockModalProps = {
	opened: boolean,
	onClose: () => void,
	onSubmit: (payloads: CreateEventStockFormPayload[]) => void,
	isSubmitting: boolean,
	event: Event,
};

function useBulkCreateEventStocks(
	opened: boolean,
	onSubmit: (payloads: CreateEventStockFormPayload[]) => void,
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
				};
			}
			return next;
		});
	}, [selectedProducts]);

	const setLineSellPrice = useCallback((productId: string, value: number | string) => {
		setLineByProductId((prev) => ({
			...prev,
			[productId]: { sellPrice: value },
		}));
	}, []);

	const onSave = useCallback(() => {
		if (selectedProducts.length === 0) {
			return;
		}
		const payloads: CreateEventStockFormPayload[] = [];
		for (const product of selectedProducts) {
			const line = lineByProductId[product.id];
			if (!line) {
				continue;
			}
			// An empty field is not zero. Number('') is 0, so testing the parsed value alone would
			// let a product the operator never priced through at 0 ₫.
			if (line.sellPrice === '' || line.sellPrice == null) {
				return;
			}
			const price = Number(line.sellPrice);
			if (Number.isNaN(price) || price < 0) {
				return;
			}
			payloads.push({
				productRef: product.id,
				sellPrice: price,
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
		onSave,
	};
}

export const CreateEventStockModal: React.FC<CreateEventStockModalProps> = ({
	opened, onClose, onSubmit, isSubmitting, event,
}) => {
	const { t } = useTranslation('vending_machine');
	const {
		selectedProducts,
		setSelectedProducts,
		lineByProductId,
		setLineSellPrice,
		onSave,
	} = useBulkCreateEventStocks(opened, onSubmit);


	const [slideIndex, setSlideIndex] = useState(0);
	const goToBrowse = useCallback(() => setSlideIndex(0), []);
	const goToSelected = useCallback(() => setSlideIndex(1), []);

	const { filters, graph } = useKioskProductFilter();
	const { products, pagination, handleRefresh, listError } = useAvailableProductForEvent(event.id, graph);

	const viewSelectedLabel = useMemo(() => {
		const base = t('events.event_stock.create.view_selected', {
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
				label: t('action.refresh'),
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
			title={t('events.event_stock.create.title', {
				defaultValue: 'Add product to event',
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
								maxSelected={5}
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
								{t('events.event_stock.create.back_to_browse', {
									defaultValue: 'Back to product list',
								})}
							</Button>
							<SelectedProducts
								selectedProducts={selectedProducts}
								lineByProductId={lineByProductId}
								setLineSellPrice={setLineSellPrice}
								scrollMaxHeight={380}
								emptyHint={
									t('events.event_stock.create.none_selected_slide', {
										defaultValue: 'Nothing selected yet. Go back and pick one or more products.',
									})
								}
							/>
						</Stack>
					</SlideStrip>
				</SlideExpose>
				<Group justify='flex-end' mt='md'>
					<Button variant='default' onClick={onClose} disabled={isSubmitting}>
						{t('action.cancel')}
					</Button>
					<Button
						loading={isSubmitting}
						disabled={selectedProducts.length === 0}
						onClick={onSave}
					>
						{t('action.add', { defaultValue: 'Add' })}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
