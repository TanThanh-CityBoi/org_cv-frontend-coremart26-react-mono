import { Avatar, Text } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { catalogById } from './eventStock.helpers';
import { asLegacyModelSchema, getLocalizedName } from '../../../../../common/helpers';
import { PaginationConfig } from '../../../../../common/hooks';
import { TableAction, TableContainer, TablePagination, type TableActionItem } from '../../../../../components/Table';
import { MOCK_EVENT_STOCK_CREATE_PRODUCTS } from '../../../mocks/mockEventStockCreateProducts';


import type { EventStockCatalogProduct } from './eventStock.types';
import type { EventStock } from '../../../types';


export interface EventStockListProps {
	stocks: EventStock[];
	isLoading?: boolean;
	pagination: PaginationConfig;
	onEdit: (stock: EventStock) => void;
	onDelete: (stock: EventStock) => void;
}

// ─── schema ──────────────────────────────────────────────────────────────────

const EVENT_STOCK_LIST_COLUMNS = ['image', 'name', 'sku', 'price', 'actions'] as const;

const eventStockListSchema = asLegacyModelSchema({
	name: 'EventStockList',
	fields: {
		image: { type: 'string', label: 'image' },
		sku: { type: 'string', label: 'kiosk.stocks.fields.sku' },
		name: { type: 'string', label: 'kiosk.stocks.fields.name' },
		price: { type: 'string', label: 'kiosk.stocks.fields.price' },
		actions: { type: 'string', label: 'kiosk.stocks.fields.actions' },
	},
});

// ─── helpers ─────────────────────────────────────────────────────────────────

const CATALOG_MAP = catalogById(MOCK_EVENT_STOCK_CREATE_PRODUCTS);

function mapStocksToTableData(
	stocks: EventStock[] = [],
	lang: string,
	catalog: Map<string, EventStockCatalogProduct>,
): Record<string, unknown>[] {
	return stocks.map((stock) => {
		const product = catalog.get(stock.productRef);
		return {
			id: stock.id,
			image: product?.imageUrl,
			sku: product?.sku ?? stock.productRef,
			name: product ? getLocalizedName(product.name, lang) : stock.productRef,
			price: stock.sellPrice,
		};
	});
}

function buildRowActions(
	stock: EventStock,
	onEdit: (s: EventStock) => void,
	onDelete: (s: EventStock) => void,
	translate: TFunction,
): TableActionItem[] {
	return [
		{
			key: 'edit',
			label: translate('action.edit'),
			icon: <IconEdit size={16} />,
			onClick: () => onEdit(stock),
		},
		{
			key: 'delete',
			label: translate('action.delete'),
			icon: <IconTrash size={16} />,
			color: 'red',
			onClick: () => onDelete(stock),
		},
	];
}

// ─── renderers hook ───────────────────────────────────────────────────────────

function useEventStockRenderers(
	stocks: EventStock[],
	onEdit: (s: EventStock) => void,
	onDelete: (s: EventStock) => void,
) {
	const { t: translate } = useTranslation('vending_machine');

	const stocksById = useMemo(() => {
		const m = new Map<string, EventStock>();
		for (const s of stocks) {
			if (s.id) m.set(s.id, s);
		}
		return m;
	}, [stocks]);

	const renderPrice = useCallback((row: Record<string, unknown>) => {
		const p = row.price;
		if (p === null || p === undefined || p === '') return <Text size='sm'>—</Text>;
		const n = Number(String(p).replace(/\s/g, ''));
		return Number.isNaN(n)
			? <Text size='sm'>{String(p)}</Text>
			: <Text size='sm'>{n.toLocaleString('vi-VN')} đ</Text>;
	}, []);

	const renderActions = useCallback((row: Record<string, unknown>) => {
		const stock = stocksById.get(String(row.id ?? ''));
		if (!stock) return null;
		return (
			<TableAction
				actions={buildRowActions(stock, onEdit, onDelete, translate)}
				overflowMenuLabel={translate('action.title')}
			/>
		);
	}, [stocksById, onEdit, onDelete, translate]);

	const columnRenderers = useMemo(() => ({
		image: (row: Record<string, unknown>) => (
			<Avatar src={row.image as string | undefined} alt={String(row.name)} size='lg' />
		),
		sku: (row: Record<string, unknown>) => <Text size='sm'>{String(row.sku ?? '')}</Text>,
		name: (row: Record<string, unknown>) => <Text size='sm' fw={500}>{String(row.name ?? '')}</Text>,
		price: renderPrice,
		actions: renderActions,
	}), [renderPrice, renderActions]);

	const headerRenderers = useMemo(() => ({
		image: () => '',
		actions: () => (
			<Text size='sm' fw={600} fz='sm' ta='end'>
				{translate('action.title')}
			</Text>
		),
	}), [translate]);

	return { columnRenderers, headerRenderers };
}

// ─── component ───────────────────────────────────────────────────────────────

export const EventStockList: React.FC<EventStockListProps> = ({
	stocks,
	isLoading = false,
	pagination,
	onEdit,
	onDelete,
}) => {
	const { i18n } = useTranslation('vending_machine');

	const tableData = useMemo(
		() => mapStocksToTableData(stocks, i18n.language, CATALOG_MAP),
		[stocks, i18n.language],
	);

	const { columnRenderers, headerRenderers } = useEventStockRenderers(stocks, onEdit, onDelete);

	return (
		<TableContainer
			footer={
				<TablePagination
					totalItems={pagination.totalItems}
					page={pagination.page}
					totalPages={pagination.totalPages}
					onPageChange={pagination.onPageChange}
					pageSize={pagination.pageSize}
					onPageSizeChange={pagination.onPageSizeChange}
				/>
			}
		>
			<AutoTable
				translationNs='vending_machine'
				schema={eventStockListSchema}
				columns={[...EVENT_STOCK_LIST_COLUMNS]}
				data={tableData}
				isLoading={isLoading && !tableData.length}
				columnRenderers={columnRenderers}
				headerRenderers={headerRenderers}
				striped='even'
				highlightOnHover
				theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
			/>
		</TableContainer>
	);
};
