/* eslint-disable max-lines-per-function */


import { Alert, Avatar, Button, Group, Stack, Text } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDownload } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { fmtNumber, getLocalizedName } from '@/common/helpers';
import { PaginationConfig } from '@/common/hooks';
import { TableContainer, TablePagination } from '@/components/Table';

import type { InventoryTableColumnKey, ProductInventoryReport } from './type';



const INVENTORY_TABLE_COLUMNS: InventoryTableColumnKey[] = [
	'productName',
	'totalQty',
	'sellingQty',
	'warningQty',
	'maxQty',
];

const inventoryReportSchema: ModelSchema = {
	name: 'InventoryReport',
	fields: {
		productName: { type: 'string', label: 'coremart.vendingMachine.reports.inventoryReport.columns.productName' },
		totalQty: { type: 'string', label: 'coremart.vendingMachine.reports.inventoryReport.columns.totalQty' },
		sellingQty: { type: 'string', label: 'coremart.vendingMachine.reports.inventoryReport.columns.sellingQty' },
		warningQty: { type: 'string', label: 'coremart.vendingMachine.reports.inventoryReport.columns.warningQty' },
		maxQty: { type: 'string', label: 'coremart.vendingMachine.reports.inventoryReport.columns.maxQty' },
	},
};


type InventoryReportTableProps = {
	items?: ProductInventoryReport[];
	isLoading?: boolean;
	error?: string | null;
	pagination?: PaginationConfig;
	handleExport?: () => void;
};

function mapRow(r: ProductInventoryReport, lang: string): Record<string, unknown> {
	return {
		productName: getLocalizedName(r.name, lang),
		sku: r.sku,
		totalQty: fmtNumber(r.remainingQuantity) ?? '—',
		sellingQty: fmtNumber(r.activeRemainingQuantity) ?? '—',
		warningQty: fmtNumber(r.warningQuantity) ?? '—',
		maxQty: fmtNumber(r.capacityQuantity) ?? '—',
	};
}

export function InventoryReportTable({
	items,
	isLoading,
	error,
	pagination,
	handleExport,
}: InventoryReportTableProps): React.ReactElement {
	const { t: translate, i18n } = useTranslation();

	const tableData = useMemo(
		() => items?.map((r) => mapRow(r, i18n.language)) ?? [],
		[items, i18n.language],
	);

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		productName: (row) => {
			return (
				<Group gap='md' wrap='nowrap'>
					<Avatar
						src={String(row.imageUrl ?? '')}
						alt={String(row.productName ?? '—')}
						size='md'
						radius='sm'
					/>
					<Stack gap={4}>
						<Text size='sm' fw={600}>{String(row.productName ?? '—')}</Text>
						<Text size='sm' c='dimmed'>{String(row.sku ?? '—')}</Text>
					</Stack>
				</Group>
			);
		},
		totalQty: (row) => <Text size='sm' ta='end'>{String(row.totalQty ?? '—')}</Text>,
		sellingQty: (row) => <Text size='sm' ta='end'>{String(row.sellingQty ?? '—')}</Text>,
		warningQty: (row) => <Text size='sm' ta='end'>{String(row.warningQty ?? '—')}</Text>,
		maxQty: (row) => <Text size='sm' ta='end'>{String(row.maxQty ?? '—')}</Text>,
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		totalQty: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.inventoryReport.columns.totalQty')}</Text>,
		sellingQty: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.inventoryReport.columns.sellingQty')}</Text>,
		warningQty: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.inventoryReport.columns.warningQty')}</Text>,
		maxQty: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.inventoryReport.columns.maxQty')}</Text>,
	};

	const header = (
		<Group justify='flex-end' mb={6}>
			<Button
				size='sm'
				leftSection={<IconDownload size={16} />}
				disabled={isLoading || !pagination?.totalItems}
				onClick={handleExport}
			>
				{translate('coremart.vendingMachine.reports.revenueReport.export')}
			</Button>
		</Group>

	);

	if (error) {
		return (
			<Alert color='red.4' bg='red.0'>
				{error}
			</Alert>
		);
	}

	return (
		<TableContainer
			minWidth={720}
			header={header}
			footer={pagination ? <TablePagination {...pagination} /> : undefined}
			withBorder
			shadow='sm'
			unstyledScrollContainer
		>
			<AutoTable
				columns={[...INVENTORY_TABLE_COLUMNS]}
				data={tableData}
				schema={inventoryReportSchema}
				isLoading={isLoading}
				columnRenderers={colRenderers}
				headerRenderers={headerRenderers}
				striped='even'
				highlightOnHover
				theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
			/>
		</TableContainer>
	);
}
