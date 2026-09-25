import { Box, Text } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import {
	IconArchive,
	IconDownload,
	IconEye,
	IconPencil,
	IconRestore,
	IconTrash,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { formatDateTime } from '../../../../common/helpers/format-time';
import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { NameCell, TableAction, TableContainer, TablePagination, type TableActionItem, TextCell } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';

import type { KioskMedia } from '../../types';


function renderActionsHeader(
	_columnName: string,
	_schema: unknown,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta='end'>{translate('action.title')}</Text>;
}

export type KioskMediaTableActions = {
	onView?: (km: KioskMedia) => void,
	onDelete?: (km: KioskMedia) => void,
	onArchive?: (km: KioskMedia) => void,
	onRestore?: (km: KioskMedia) => void,
	onEdit?: (km: KioskMedia) => void,
	onDownload?: (km: KioskMedia) => void,
};

export function getKioskMediaTableActions(
	km: KioskMedia,
	actions: KioskMediaTableActions,
	translate: TFunction,
): TableActionItem[] {
	const list: (TableActionItem & { active?: boolean })[] = [
		{
			key: 'view',
			label: translate('action.view'),
			icon: <IconEye size={16} />,
			onClick: () => actions.onView?.(km),
			color: 'blue',
			active: !!actions.onView,
		},
		{
			key: 'rename',
			label: translate('action.rename'),
			icon: <IconPencil size={16} />,
			onClick: () => actions.onEdit?.(km),
			color: 'blue',
			active: !!actions.onEdit,
		},
		{
			key: 'download',
			label: translate('action.download'),
			icon: <IconDownload size={16} />,
			onClick: () => actions.onDownload?.(km),
			color: 'blue',
			active: !!actions.onDownload,
		},
		{
			key: 'archive',
			label: translate('action.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions.onArchive?.(km),
			color: 'orange',
			active: km.isArchived !== true && !!actions.onArchive,
		},
		{
			key: 'restore',
			label: translate('action.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions.onRestore?.(km),
			color: 'blue',
			active: km.isArchived === true && !!actions.onRestore,
		},
		{
			key: 'delete',
			label: translate('action.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions.onDelete?.(km),
			color: 'red',
			active: !!actions.onDelete,
		},
	];
	return list
		.filter((row) => row.active)
		.map(({ key, label, icon, onClick, color }) => ({ key, label, icon, onClick, color }));
}

export interface KioskMediaTableProps extends AutoTableProps {
	pagination: TablePaginationProps;
	tableActions?: KioskMediaTableActions;
}

export const KioskMediaTable: React.FC<KioskMediaTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	pagination,
	tableActions,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const hasActions = tableActions && (
		tableActions.onView ||
		tableActions.onEdit ||
		tableActions.onDownload ||
		tableActions.onDelete ||
		tableActions.onArchive ||
		tableActions.onRestore
	);

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		name: (row) => <NameCell content={row.name as string}
			onClick={() => tableActions?.onView?.(row as unknown as KioskMedia)}
		/>,
		mediaType: (row) => <TextCell content={String(row.mediaType ?? '—')} />,
		scopeType: (row) => {
			const km = row as unknown as KioskMedia;
			const key = `media_playlist.scope_type.${km.scopeType}`;
			return <TextCell content={translate(key)} />;
		},
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		createdAt: (row) => <TextCell content={formatDateTime(row.createdAt as string)} />,
		...(hasActions && tableActions
			? {
				actions: (row) => (
					<TableAction
						actions={getKioskMediaTableActions(row as unknown as KioskMedia, tableActions, translate)}
						overflowMenuLabel={translate('action.title')}
					/>
				),
			}
			: {}),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = hasActions
		? { actions: (columnName) => renderActionsHeader(columnName, undefined, translate) }
		: undefined;

	return (
		<Box pos='relative'>
			<TableContainer footer={<TablePagination {...pagination} />}>
				<AutoTable
					translationNs='vending_machine'
					columns={columns}
					data={data}
					schema={schema}
					isLoading={isLoading}
					columnRenderers={colRenderers}
					headerRenderers={headerRenderers}
					striped='even'
					highlightOnHover
					theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
				/>
			</TableContainer>
		</Box>
	);
};
