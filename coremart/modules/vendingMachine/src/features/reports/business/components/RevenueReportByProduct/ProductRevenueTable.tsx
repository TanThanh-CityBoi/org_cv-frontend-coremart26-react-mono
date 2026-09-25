/* eslint-disable max-lines-per-function */
import { Alert, Avatar, Button, Group, Stack, Text, Title } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconDownload } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { fmtCurrency, fmtNumber, getLocalizedName } from '@/common/helpers';
import { PaginationConfig } from '@/common/hooks/usePagination';
import {
	TimeRangeSelect,
	type TimeRangePreset,
	type TimeRangePresetRange,
} from '@/components/RangePicker';
import { TableContainer, TablePagination } from '@/components/Table';
import { TextLink } from '@/components/Text';

import type { RevenueReportByProduct } from '@/features/reports/business/type';


const BY_PRODUCT_COLUMNS = ['product', 'category', 'qty', 'revenue'] as const;

const byProductSchema: ModelSchema = {
	name: 'RevenueByProduct',
	fields: {
		product: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.product' },
		category: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.category' },
		qty: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.quantity' },
		revenue: { type: 'string', label: 'coremart.vendingMachine.reports.revenueReport.columns.revenue' },
	},
};

export type ProductRevenueTableProps = {
	items: RevenueReportByProduct[];
	pagination: PaginationConfig;
	isLoading?: boolean;
	error?: string | null;
	handleExport?: () => void;
	title?: string;
	description?: string;
	showFilter?: boolean;
	activePreset?: TimeRangePreset;
	defaultPreset?: TimeRangePreset;
	onFilterChange?: (preset: TimeRangePreset, range: TimeRangePresetRange) => void;
};

function mapProductRowsToTableData(
	rows: RevenueReportByProduct[] = [],
	language: string,
): Record<string, unknown>[] {
	return rows.map((row) => ({
		product: getLocalizedName(row.productName, language) || row.productId,
		category: '—',
		qty: fmtNumber(row.totalItemCount) ?? '—',
		revenue: fmtCurrency(row.totalRevenue) ?? '—',
	}));
}

export function ProductRevenueTable({
	title,
	description,
	items,
	pagination,
	isLoading,
	error,
	handleExport,
	showFilter = false,
	activePreset,
	defaultPreset = 'this_month',
	onFilterChange,
}: ProductRevenueTableProps): React.ReactElement {
	const { t: translate, i18n } = useTranslation();

	const tableData = useMemo(
		() => mapProductRowsToTableData(items, i18n.language),
		[items, i18n.language],
	);

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		product: (row) => (
			<Group gap='md' wrap='nowrap'>
				<Avatar
					src={String(row.thumbnailUrl ?? '')} // TODO: add thumbnail URL, api not yet implemented
					alt={String(row.product ?? '—')}
					size='md'
					radius='sm'
				/>
				<TextLink
					to={'#'} size='sm'
					onClick={(e) => e.preventDefault()}
				>
					{String(row.product ?? '—')}
				</TextLink>
			</Group>
		),
		category: (row) => <Text size='sm'>{String(row.category ?? '—')}</Text>,
		qty: (row) => <Text size='sm' ta='end'>{String(row.qty ?? '—')}</Text>,
		revenue: (row) => <Text size='sm' ta='end'>{String(row.revenue ?? '—')}</Text>,
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		qty: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.revenueReport.columns.quantity')}</Text>,
		revenue: () => <Text fw={600} fz='sm' ta='end'>{translate('coremart.vendingMachine.reports.revenueReport.columns.revenue')}</Text>,
	};


	return (
		<TableContainer
			minWidth={560} h='100%'
			withBorder
			shadow='sm'
			unstyledScrollContainer
			header={(title || handleExport || showFilter) && (
				<Group justify='space-between' align='flex-start' wrap='nowrap' mb={6}>
					{title && (
						<Stack gap={2} ps={3}>
							<Title order={4} fw={600}>
								{title}
							</Title>
							<Text size='xs' c='dimmed'>
								{description}
							</Text>
						</Stack>
					)}
					<Group gap='sm' align='center'>
						{showFilter && (
							<TimeRangeSelect
								value={activePreset}
								defaultValue={defaultPreset}
								onChange={onFilterChange}
							/>
						)}
						{handleExport && (
							<Button
								size='sm'
								leftSection={<IconDownload size={16} />}
								disabled={isLoading || !pagination.totalItems}
								onClick={handleExport}
							>
								{translate('coremart.vendingMachine.reports.revenueReport.export')}
							</Button>
						)}
					</Group>
				</Group>
			)}
			footer={<TablePagination {...pagination} />}
		>
			{error ? (
				<Alert color='red.4' bg='red.0'>
					{error}
				</Alert>
			) : (
				<AutoTable
					columns={[...BY_PRODUCT_COLUMNS]}
					data={tableData}
					schema={byProductSchema}
					isLoading={isLoading}
					columnRenderers={colRenderers}
					headerRenderers={headerRenderers}
					striped='even'
					highlightOnHover
					theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
				/>
			)}
		</TableContainer>
	);
}
