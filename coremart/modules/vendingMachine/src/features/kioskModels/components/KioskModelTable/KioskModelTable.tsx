import { Box, Text } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import {
	IconArchive,
	IconEye,
	IconLayoutSidebarRightExpand,
	IconRestore,
	IconTrash,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import {
	NameCell, TableAction, TableContainer, TablePagination,
	type TableActionItem, type TablePaginationProps,
} from '@/components/Table';

import { KioskModel } from '../../types';



const KIOSK_MODEL_ACTIONS = {
	PREVIEW: 'preview',
	VIEW_DETAIL: 'viewDetail',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type KioskModelActionType = (typeof KIOSK_MODEL_ACTIONS)[keyof typeof KIOSK_MODEL_ACTIONS];

export type KioskModelTableActions = {
	[key in KioskModelActionType]?: (kioskModel: KioskModel, ...args: unknown[]) => void;
};

export function getKioskModelTableActions(
	model: KioskModel,
	actions: KioskModelTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: KIOSK_MODEL_ACTIONS.PREVIEW,
			label: translate('nikki.general.actions.preview'),
			icon: <IconLayoutSidebarRightExpand size={20} stroke={1.6} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.PREVIEW]?.(model),
			color: 'gray',
			active: !!actions[KIOSK_MODEL_ACTIONS.PREVIEW],
		},
		{
			key: KIOSK_MODEL_ACTIONS.VIEW_DETAIL,
			label: translate('nikki.general.actions.viewDetail'),
			icon: <IconEye size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.VIEW_DETAIL]?.(model),
			color: 'blue',
			active: !!actions[KIOSK_MODEL_ACTIONS.VIEW_DETAIL],
		},
		{
			key: KIOSK_MODEL_ACTIONS.ARCHIVE,
			label: translate('nikki.general.actions.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.ARCHIVE]?.(model),
			color: 'orange',
			active: !model.isArchived && !!actions[KIOSK_MODEL_ACTIONS.ARCHIVE],
		},
		{
			key: KIOSK_MODEL_ACTIONS.RESTORE,
			label: translate('nikki.general.actions.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.RESTORE]?.(model),
			color: 'blue',
			active: !!model.isArchived && !!actions[KIOSK_MODEL_ACTIONS.RESTORE],
		},
		{
			key: KIOSK_MODEL_ACTIONS.DELETE,
			label: translate('nikki.general.actions.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[KIOSK_MODEL_ACTIONS.DELETE]?.(model),
			color: 'red',
			active: !!actions[KIOSK_MODEL_ACTIONS.DELETE],
		},
	];
	return defaultActions.filter((action) => action.active);
}

function renderActionsHeader(
	_columnName: string,
	_schema: unknown,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta='end'>{translate('nikki.general.actions.title')}</Text>;
}

export interface KioskModelTableProps extends AutoTableProps {
	actions: KioskModelTableActions;
	pagination: TablePaginationProps;
}

export const KioskModelTable: React.FC<KioskModelTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation();

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		referenceCode: (row) => {
			const archived = !!row.isArchived;
			const code = String(row.referenceCode || '');
			return archived
				? <Text c='var(--mantine-color-gray-7)' fw={500} td='none'>{code}</Text>
				: <Text fw={500}>{code}</Text>;
		},
		name: (row) => (
			<NameCell
				content={row.name as string}
				link={row.id ? `../kiosk-models/${row.id}` : undefined}
			/>
		),
		description: (row) => {
			const archived = !!row.isArchived;
			const text = String(row.description || '-');
			return archived
				? <Text c='var(--mantine-color-gray-7)' fw={500} td='none'>{text}</Text>
				: <Text fw={500} td='none'>{text}</Text>;
		},
		status: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		actions: (row) => (
			<TableAction
				actions={getKioskModelTableActions(row as unknown as KioskModel, actions, translate)}
				overflowMenuLabel={translate('nikki.general.actions.title')}
			/>
		),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		actions: (columnName) => renderActionsHeader(columnName, undefined, translate),
	};

	return (
		<Box pos='relative'>
			<TableContainer minWidth={500} footer={<TablePagination {...pagination} />}>
				<AutoTable
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
