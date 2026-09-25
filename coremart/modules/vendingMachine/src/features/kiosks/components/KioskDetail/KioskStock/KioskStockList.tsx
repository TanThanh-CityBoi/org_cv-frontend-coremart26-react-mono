import { Avatar, Badge, Text } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch, kioskActions, selectKioskStock } from '@/appState';
import { getLocalizedName } from '@/common/helpers';
import { usePagination } from '@/common/hooks';
import { TableAction, TableContainer, TablePagination, type TableActionItem } from '@/components/Table';
import { DeleteKioskStockModal } from '@/features/kiosks';
import { useKioskStockListTab } from '@/features/kiosks/components/KioskDetail/hooks';
import {
	useCreateKioskStockBulk,
	useKioskStockDelete,
	useKioskStockUpdate,
} from '@/features/kiosks/hooks';
import { Kiosk } from '@/features/kiosks/types';

import { CreateKioskStockModal } from './CreateKioskStockModal';
import { KioskStockEditModal } from './KioskStockEditModal';
import { KioskStockSortModal } from './KioskStockSortModal';
import {
	formatKioskStockPositionsDisplay, totalQuantityForKioskStock,
} from '../KioskStockGrid/kioskStock.helpers';

import type { KioskStock } from '../KioskStockGrid/kioskStock.types';


const KIOSK_STOCK_LIST_COLUMNS = [
	'image',
	'name',
	'sku',
	'price',
	'warningQuantity',
	'quantity',
	'positions',
	'actions',
] as const;

const kioskStockListSchema: ModelSchema = {
	name: 'KioskStockList',
	fields: {
		image: { type: 'string', label: 'image' },
		sku: { type: 'string', label: 'coremart.vendingMachine.kiosk.stocks.fields.sku' },
		name: { type: 'string', label: 'coremart.vendingMachine.kiosk.stocks.fields.name' },
		price: { type: 'integer', label: 'coremart.vendingMachine.kiosk.stocks.fields.price' },
		warningQuantity: { type: 'integer', label: 'coremart.vendingMachine.kiosk.stocks.fields.warningQuantity' },
		quantity: { type: 'integer', label: 'coremart.vendingMachine.kiosk.stocks.fields.quantity' },
		positions: { type: 'array', label: 'coremart.vendingMachine.kiosk.stocks.fields.positions' },
		actions: { type: 'string', label: 'coremart.vendingMachine.kiosk.stocks.fields.actions' },
	},
};

function mapKioskStocksToTableData(
	stocks: KioskStock[],
	lang: string,
): Record<string, unknown>[] {
	return stocks.map((stock) => {
		const product = stock.product;
		return {
			id: stock.id,
			image: product?.imageUrl,
			sku: product?.sku ?? '',
			name: getLocalizedName(product?.name, lang),
			price: stock.sellPrice,
			warningQuantity: stock.warningQuantity,
			quantity: totalQuantityForKioskStock(stock),
			positions: formatKioskStockPositionsDisplay(stock),
		};
	});
}

function getKioskStockListActions(
	stock: KioskStock,
	onEdit: (s: KioskStock) => void,
	onDelete: (s: KioskStock) => void,
	translate: TFunction,
): TableActionItem[] {
	return [
		{
			key: 'edit',
			label: translate('nikki.general.actions.edit'),
			icon: <IconEdit size={16} />,
			onClick: () => onEdit(stock),
		},
		{
			key: 'delete',
			label: translate('nikki.general.actions.delete'),
			icon: <IconTrash size={16} />,
			color: 'red',
			onClick: () => onDelete(stock),
		},
	];
}

type TableUiConfig = {
	stocksById: Map<string, KioskStock>;
	onEdit: (s: KioskStock) => void;
	onDelete: (s: KioskStock) => void;
};

function useKioskStockListTableUi(translate: ReturnType<typeof useTranslation>['t'], {
	stocksById, onEdit, onDelete,
}: TableUiConfig) {
	const columnRenderers = useMemo(
		() => ({
			image: (row: Record<string, unknown>) => (
				<Avatar src={row.image as string | undefined} alt={String(row.name)} size='lg' />
			),
			sku: (row: Record<string, unknown>) => (
				<Text size='sm'>{String(row.sku ?? '')}</Text>
			),
			name: (row: Record<string, unknown>) => (
				<Text size='sm' fw={500}>{String(row.name ?? '')}</Text>
			),
			price: (row: Record<string, unknown>) => {
				const p = row.price;
				if (p === null || p === undefined || p === '') {
					return <Text size='sm'>—</Text>;
				}
				const n = Number(p);
				if (Number.isNaN(n)) {
					return <Text size='sm'>{String(p)}</Text>;
				}
				return <Text size='sm'>{n.toLocaleString('vi-VN')} đ</Text>;
			},
			warningQuantity: (row: Record<string, unknown>) => (
				<Text size='sm'>{String(row.warningQuantity ?? '—')}</Text>
			),
			quantity: (row: Record<string, unknown>) => (
				<Badge color='green'>{Number(row.quantity)}</Badge>
			),
			positions: (row: Record<string, unknown>) => (
				<Text size='sm' c='dimmed'>
					{String(row.positions ?? '—')}
				</Text>
			),
			actions: (row: Record<string, unknown>) => {
				const id = String(row.id ?? '');
				const stock = stocksById.get(id);
				if (!stock) {
					return null;
				}
				return (
					<TableAction
						actions={getKioskStockListActions(stock, onEdit, onDelete, translate)}
						overflowMenuLabel={translate('nikki.general.actions.title')}
					/>
				);
			},
		}),
		[onDelete, onEdit, stocksById, translate],
	);

	const headerRenderers = useMemo(
		() => ({
			image: () => '',
			actions: () => <Text size='sm' fw={600} fz='sm' ta='end'>{translate('nikki.general.actions.title')}</Text>,
		}),
		[translate],
	);

	return { columnRenderers, headerRenderers };
}

export interface KioskStockListProps {
	kiosk: Kiosk;
}

function useKioskStockListPagedFetch(kioskId: string | undefined) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const kioskStockState = useMicroAppSelector(selectKioskStock);

	const fetchList = useCallback((targetPage: number, size: number) => {
		if (!kioskId) return;
		dispatch(kioskActions.fetchKioskStocks({ kioskId, page: targetPage - 1, size }));
	}, [dispatch, kioskId]);

	const pagination = usePagination(fetchList, selectKioskStock, {
		resetPageKey: kioskId,
		fallbackPageSize: 10,
	});
	const { page, pageSize } = pagination;

	useEffect(() => {
		if (kioskId) fetchList(page, pageSize);
	}, [fetchList, page, pageSize, kioskId]);

	const refetch = useCallback((overrideKioskId?: string) => {
		const id = overrideKioskId ?? kioskId;
		if (!id) return Promise.reject(new Error('Missing kiosk id'));
		return dispatch(kioskActions.fetchKioskStocks({ kioskId: id, page: page - 1, size: pageSize }));
	}, [dispatch, kioskId, page, pageSize]);

	return {
		stocks: kioskStockState.items ?? [],
		isLoading: kioskStockState.status === 'pending' || kioskStockState.status === 'idle',
		refetch,
		pagination,
	};
}

function useKioskStockListViewModel(kiosk: Kiosk) {
	const { t: translate, i18n } = useTranslation();
	const {
		stocks,
		isLoading,
		refetch,
		pagination,
	} = useKioskStockListPagedFetch(kiosk.id);
	const onMutationSuccess = useCallback(() => {
		refetch();
	}, [refetch]);
	const {
		isOpenCreateModal,
		handleOpenCreateModal,
		handleCloseModal,
		handleSubmit,
		isSubmitting,
	} = useCreateKioskStockBulk({ kiosk, onSuccess: onMutationSuccess });
	const {
		editStock,
		isEditModalOpen,
		openEditModal,
		closeEditModal,
		handleSubmit: submitKioskStockUpdate,
		isSubmitting: isKioskStockUpdateSubmitting,
	} = useKioskStockUpdate({ kiosk, onSuccess: onMutationSuccess });

	const {
		deleteStock,
		isOpenDeleteModal,
		openDeleteModal,
		closeDeleteModal,
		confirmDelete,
	} = useKioskStockDelete({ kiosk, onSuccess: onMutationSuccess });

	const [isSortModalOpen, setIsSortModalOpen] = useState(false);
	const handleOpenSortModal = useCallback(() => setIsSortModalOpen(true), []);
	const handleCloseSortModal = useCallback(() => setIsSortModalOpen(false), []);

	useKioskStockListTab({
		handleAddStock: handleOpenCreateModal,
		handleSortStock: handleOpenSortModal,
	});

	const tableData = useMemo(
		() => mapKioskStocksToTableData(stocks, i18n.language),
		[stocks, i18n.language],
	);
	const stocksById = useMemo(() => {
		const m = new Map<string, KioskStock>();
		for (const s of stocks) {
			if (s.id) {
				m.set(s.id, s);
			}
		}
		return m;
	}, [stocks]);
	const { columnRenderers, headerRenderers } = useKioskStockListTableUi(translate, {
		stocksById, onEdit: openEditModal, onDelete: openDeleteModal,
	});
	const deleteName = deleteStock
		? getLocalizedName(deleteStock.product?.name, i18n.language) || '—'
		: '';
	const deleteSku = deleteStock?.product?.sku ?? '—';
	return {
		tableData, isLoading, columnRenderers, headerRenderers, i18n, translate,
		isOpenCreateModal, handleCloseModal, handleSubmit, isSubmitting,
		isEditModalOpen, editStock, closeEditModal, submitKioskStockUpdate, isKioskStockUpdateSubmitting,
		isOpenDeleteModal, closeDeleteModal, confirmDelete, deleteName, deleteSku,
		pagination,
		isSortModalOpen, handleCloseSortModal, onMutationSuccess,
	};
}

export const KioskStockList: React.FC<KioskStockListProps> = ({ kiosk }) => {
	const vm = useKioskStockListViewModel(kiosk);
	return (
		<>
			<KioskStockSortModal
				kiosk={kiosk}
				opened={vm.isSortModalOpen}
				onClose={vm.handleCloseSortModal}
				onSuccess={vm.onMutationSuccess}
			/>
			<CreateKioskStockModal
				kiosk={kiosk}
				opened={vm.isOpenCreateModal}
				onClose={vm.handleCloseModal}
				onSubmit={vm.handleSubmit}
				isSubmitting={vm.isSubmitting}
			/>
			<KioskStockEditModal
				opened={vm.isEditModalOpen}
				stock={vm.editStock}
				lang={vm.i18n.language}
				onClose={vm.closeEditModal}
				onSubmit={vm.submitKioskStockUpdate}
				isSubmitting={vm.isKioskStockUpdateSubmitting}
			/>
			<DeleteKioskStockModal
				opened={vm.isOpenDeleteModal}
				onClose={vm.closeDeleteModal}
				onConfirm={vm.confirmDelete}
				productName={vm.deleteName}
				sku={vm.deleteSku}
			/>
			<TableContainer
				footer={
					<TablePagination
						totalItems={vm.pagination.totalItems}
						page={vm.pagination.page}
						totalPages={vm.pagination.totalPages}
						onPageChange={vm.pagination.onPageChange}
						pageSize={vm.pagination.pageSize}
						onPageSizeChange={vm.pagination.onPageSizeChange}
					/>
				}
			>
				<AutoTable
					schema={kioskStockListSchema}
					columns={[...KIOSK_STOCK_LIST_COLUMNS]}
					data={vm.tableData}
					isLoading={vm.isLoading && !vm?.tableData?.length}
					columnRenderers={vm.columnRenderers}
					headerRenderers={vm.headerRenderers}
					striped='even'
					highlightOnHover
					theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
				/>
			</TableContainer>
		</>
	);
};
