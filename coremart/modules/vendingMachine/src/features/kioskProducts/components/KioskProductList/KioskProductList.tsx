/* eslint-disable max-lines-per-function */
import { Center, SimpleGrid, Stack, Text } from '@mantine/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { KioskProductCard } from './KioskProductCard';
import { KioskProductTable } from './KioskProductTable';
import { getLocalizedName } from '../../../../common/helpers';
import { ViewMode } from '../../../../components';
import { TableContainer, TablePagination } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';
import { KioskProduct } from '../../type';




export type KioskProductListProps = {
	products: KioskProduct[],
	pagination: TablePaginationProps,
	error: string | null,
	viewMode: ViewMode,
	/** When false, at most one product (replace on click; click same again clears). When true, toggle membership. */
	multiSelect?: boolean,
	/** Selected rows; pass with {@link onSelectProductsChange} for controlled usage, or omit for uncontrolled. */
	selectedProducts?: KioskProduct[],
	onSelectProductsChange?: (products: KioskProduct[]) => void,
	scrollAreaHeight?: number,

	maxSelected?: number,
};

export const KioskProductList: React.FC<KioskProductListProps> = ({
	products,
	pagination,
	viewMode,
	error,
	multiSelect = false,
	selectedProducts,
	onSelectProductsChange,
	scrollAreaHeight = 360,
	maxSelected = 10,
}) => {
	const { t } = useTranslation('vending_machine');
	const [localSelectedProducts, setLocalSelectedProducts] = useState<KioskProduct[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { i18n } = useTranslation('vending_machine');

	const displayNameFor = useMemo(
		() => (p: KioskProduct) => getLocalizedName(p.name, i18n.language),
		[i18n.language],
	);

	const isControlled = selectedProducts !== undefined;
	const effectiveSelected: KioskProduct[] = isControlled ? selectedProducts! : localSelectedProducts;

	const isMaxSelected = effectiveSelected.length >= maxSelected;
	const selectionEnabled = multiSelect || onSelectProductsChange != null || isControlled;

	const commitSelection = useCallback(
		(next: KioskProduct[]) => {
			if (!isControlled) {
				setLocalSelectedProducts(next);
			}
			onSelectProductsChange?.(next);
		},
		[isControlled, onSelectProductsChange],
	);

	const isProductSelected = useCallback(
		(id: string) => effectiveSelected.some((p) => p.id === id),
		[effectiveSelected],
	);

	const handleProductActivate = useCallback(
		(product: KioskProduct) => {
			if (!selectionEnabled) {
				return;
			}
			setErrorMessage(null);
			if (multiSelect) {
				const has = effectiveSelected.some((p) => p.id === product.id);
				if (isMaxSelected && !has) {
					setErrorMessage(t('kiosk_products.messages.max_selected', {
						defaultValue: 'You have reached the maximum number of products',
					}));
					return;
				}
				const next = has
					? effectiveSelected.filter((p) => p.id !== product.id)
					: [...effectiveSelected, product];
				commitSelection(next);
				return;
			}
			const next = [product];
			commitSelection(next);
		},
		[
			selectionEnabled,
			multiSelect,
			isMaxSelected,
			effectiveSelected,
			commitSelection,
		],
	);

	useEffect(() => {
		if (!multiSelect && !isControlled && localSelectedProducts.length > 1) {
			setLocalSelectedProducts((prev) => [prev[0]!]);
		}
	}, [multiSelect, isControlled, localSelectedProducts.length]);

	return (
		<Stack gap='sm' h={'max-content'} mih={420}>
			{products.length === 0 ? (
				<Center h={scrollAreaHeight}>
					<Text size='sm' c={error ? 'red' : 'dimmed'} ta='center' py='xl'>
						{error ?? t('kiosk_products.messages.no_results')}
					</Text>
				</Center>
			) : (
				<Stack gap={'xs'}>
					{errorMessage && (
						<Text size='sm' c='red' ta='start'>
							{errorMessage}
						</Text>
					)}
					<TableContainer
						minHeight={scrollAreaHeight}
						maxHeight={scrollAreaHeight}
						footer={<TablePagination {...pagination} />}
					>
						{viewMode === 'grid' ? (
							<SimpleGrid cols={{ base: 1, sm: 3, md: 4 }} spacing='md'>
								{products.map((p: KioskProduct) => (
									<KioskProductCard
										key={p.id}
										product={p}
										displayName={displayNameFor(p)}
										selected={isProductSelected(p.id)}
										onSelect={selectionEnabled ? handleProductActivate : undefined}
									/>
								))}
							</SimpleGrid>
						) : (
							<KioskProductTable
								products={products}
								displayNameFor={displayNameFor}
								isRowSelected={selectionEnabled ? isProductSelected : undefined}
								onRowActivate={selectionEnabled ? handleProductActivate : undefined}
							/>
						)}
					</TableContainer>
				</Stack>
			)}
		</Stack>
	);
};
