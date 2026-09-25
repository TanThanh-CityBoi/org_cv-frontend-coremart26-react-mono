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
import { NameCell, TableAction, TableContainer, TablePagination, type TableActionItem, TextCell } from '@/components/Table';
import { type TablePaginationProps } from '@/components/Table';

import { Setting } from '../../types';


const SETTING_ACTIONS = {
	PREVIEW: 'preview',
	VIEW_DETAIL: 'viewDetail',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;

type SettingActionType = (typeof SETTING_ACTIONS)[keyof typeof SETTING_ACTIONS];

export type SettingTableActions = {
	[key in SettingActionType]?: (setting: Setting, ...args: unknown[]) => void;
};

export interface SettingTableProps extends AutoTableProps {
	actions: SettingTableActions;
	pagination: TablePaginationProps;
}

export function getSettingTableActions(
	setting: Setting,
	actions: SettingTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: SETTING_ACTIONS.PREVIEW,
			label: translate('nikki.general.actions.preview'),
			icon: <IconLayoutSidebarRightExpand size={20} stroke={1.6} />,
			onClick: () => actions[SETTING_ACTIONS.PREVIEW]?.(setting),
			color: 'gray',
			active: !!actions[SETTING_ACTIONS.PREVIEW],
		},
		{
			key: SETTING_ACTIONS.VIEW_DETAIL,
			label: translate('nikki.general.actions.viewDetail'),
			icon: <IconEye size={16} />,
			onClick: () => actions[SETTING_ACTIONS.VIEW_DETAIL]?.(setting),
			color: 'blue',
			active: !!actions[SETTING_ACTIONS.VIEW_DETAIL],
		},
		{
			key: SETTING_ACTIONS.ARCHIVE,
			label: translate('nikki.general.actions.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[SETTING_ACTIONS.ARCHIVE]?.(setting),
			color: 'orange',
			active: !setting.isArchived && !!actions[SETTING_ACTIONS.ARCHIVE],
		},
		{
			key: SETTING_ACTIONS.RESTORE,
			label: translate('nikki.general.actions.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[SETTING_ACTIONS.RESTORE]?.(setting),
			color: 'blue',
			active: !!setting.isArchived && !!actions[SETTING_ACTIONS.RESTORE],
		},
		{
			key: SETTING_ACTIONS.DELETE,
			label: translate('nikki.general.actions.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[SETTING_ACTIONS.DELETE]?.(setting),
			color: 'red',
			active: !!actions[SETTING_ACTIONS.DELETE],
		},
	];

	return defaultActions.filter((action) => action.active);
}

export const SettingTable: React.FC<SettingTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation();

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		code: (row) => <TextCell content={row.code as string} />,
		name: (row) => (
			<NameCell link={row.id ? `../settings/${row.id}` : undefined}>
				{row.name as string}
			</NameCell>
		),
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		actions: (row) => (
			<TableAction
				actions={getSettingTableActions(row as unknown as Setting, actions, translate)}
				overflowMenuLabel={translate('nikki.general.actions.title')}
			/>
		),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		actions: () => (
			<Text fw={600} fz='sm' ta='end'>
				{translate('nikki.general.actions.title')}
			</Text>
		),
	};

	return (
		<Box pos='relative'>
			<TableContainer
				minWidth={500}
				footer={<TablePagination {...pagination} />}
			>
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
