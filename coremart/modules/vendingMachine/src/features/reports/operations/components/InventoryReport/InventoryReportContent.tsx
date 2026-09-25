import { Stack } from '@mantine/core';
import React from 'react';

import { InventoryReportTable } from './InventoryReportTable';
import { useInventoryProducts } from '../../hooks';

import type { InventoryReportAppliedFilters } from './type';


type InventoryReportContentProps = {
	applied: InventoryReportAppliedFilters;
};

export function InventoryReportContent({ applied }: InventoryReportContentProps): React.ReactElement {
	const { items: tableItems,
		isLoading: tableLoading,
		error: tableError,
		pagination,
		handleExport,
	} = useInventoryProducts(applied);

	return (
		<Stack gap='md'>
			<InventoryReportTable
				items={tableItems}
				isLoading={tableLoading}
				error={tableError}
				pagination={pagination}
				handleExport={handleExport}
			/>
		</Stack>
	);
}
