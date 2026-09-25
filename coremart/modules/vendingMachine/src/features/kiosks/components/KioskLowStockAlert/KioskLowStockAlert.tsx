import {
	Badge,
	Button,
	Card,
	Group,
	Progress,
	Stack,
	Text,
	Title,
	Tooltip,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconPackage, IconArrowRight } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { getLocalizedName } from '@/common/helpers';
import { PaginationConfig } from '@/common/hooks';
import { TableContainer, TablePagination } from '@/components/Table';
import { LowStockWarning } from '@/features/reports/operations/type';


interface KioskLowStockAlertProps {
	data: LowStockWarning[];
	pagination: PaginationConfig;
	detailLink?: string;
}

const lowStockAlertSchema: ModelSchema = {
	name: 'lowStockAlert',
	fields: {
		id: { type: 'string', label: '', hidden: true },
		kioskCode: { type: 'string', label: 'coremart.vendingMachine.overview.lowStock.kioskCode' },
		kioskName: { type: 'string', label: 'coremart.vendingMachine.overview.lowStock.kioskName' },
		stockRatio: { type: 'string', label: 'coremart.vendingMachine.overview.lowStock.stockRatio' },
		items: { type: 'string', label: 'coremart.vendingMachine.overview.lowStock.items' },
		status: { type: 'string', label: 'coremart.vendingMachine.overview.lowStock.status' },
	},
};

function renderKioskCodeColumn(row: Record<string, unknown>) {
	return (
		<Group gap='xs'>
			<IconPackage size={16} />
			<Text size='sm' fw={500}>
				{String(row.kioskCode || '')}
			</Text>
		</Group>
	);
}

function _renderStockRatioColumn(row: Record<string, unknown>) {
	const stockRatio = (row.stockRatio as number) || 0;
	return (
		<Progress
			value={stockRatio * 100}
			color={stockRatio < 0.1 ? 'red' : stockRatio < 0.2 ? 'orange' : 'yellow'}
			size='sm'
		/>
	);
}

type AlertItem = {
	productId: string;
	productName: string;
	currentStock: number;
	maxStock: number;
};

function renderItemsColumn(row: Record<string, unknown>) {
	const items = (row.items as Array<AlertItem>) || [];
	return (
		<Stack gap={4}>
			{items.map((item) => (
				<Group gap='xs' key={item.productId}>
					<Text size='sm'>
						{item.productName}:
					</Text>
					<Text size='sm' fw={500} c='var(--mantine-color-orange-6)'>
						{item.currentStock} / {item.maxStock}
					</Text>
				</Group>
			))}
		</Stack>
	);
}


function renderStockRatioColumn(row: Record<string, unknown>) {
	const items = (row.items as Array<AlertItem>) || [];
	return (
		<Stack gap={'xs'}>
			{items.map((item) => {
				const stockRatio = item.currentStock / item.maxStock;
				return (
					<Tooltip label={item.productName} key={item.productId}>
						<Progress
							value={stockRatio * 100}
							color={stockRatio < 0.1 ? 'red' : stockRatio < 0.2 ? 'orange' : 'yellow'}
							size='md'
						/>
					</Tooltip>
				);
			})}
		</Stack>
	);
}

export function KioskLowStockAlert({ data = [], pagination, detailLink }: KioskLowStockAlertProps): React.ReactElement {
	const { t: translate, i18n } = useTranslation();

	const tableData = useMemo(() => data?.map((item) => ({
		id: item.kiosk?.kioskId || '',
		kioskCode: item.kiosk?.code || '',
		kioskName: item.kiosk?.name || '',
		items: item?.lowStocks?.map((stock) => ({
			productId: stock?.productRef || '',
			productName: getLocalizedName(stock?.product?.name, i18n.language),
			currentStock: stock?.currentQuantity || 0,
			maxStock: stock?.maxQuantity || 0,
		})) || [],
	})), [data]);

	return (
		<Card shadow='sm' padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Title order={4}>
						{translate('coremart.vendingMachine.overview.lowStock.title')}
					</Title>
					<Group gap='xs'>
						<Badge color='orange' variant='light' size='lg'>
							{pagination.totalItems} {translate('coremart.vendingMachine.overview.lowStock.kioskOutOfStock')}
						</Badge>
						{detailLink && (
							<Button
								component={Link}
								to={detailLink}
								variant='light'
								size='xs'
								rightSection={<IconArrowRight size={16} />}
							>
								{translate('coremart.vendingMachine.overview.lowStock.viewDetails')}
							</Button>
						)}
					</Group>
				</Group>

				<TableContainer
					footer={<TablePagination {...pagination} />}
				>
					<AutoTable
						columns={['kioskCode', 'kioskName', 'items', 'stockRatio']}
						data={tableData}
						schema={lowStockAlertSchema}
						columnRenderers={{
							kioskCode: renderKioskCodeColumn,
							stockRatio: renderStockRatioColumn,
							items: renderItemsColumn,
						}}
						striped='even'
						highlightOnHover
						theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
					/>
				</TableContainer>
			</Stack>
		</Card>
	);
}
