import { Box, Text } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import {
	IconEye,
	IconTrash,
	IconRestore,
	IconArchive,
	IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { NameCell, TableAction,
	TableContainer, TextCell, TablePagination, type TableActionItem } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';
import { KioskSetting } from '../../types';


const KIOSK_SETTING_ACTIONS = {
	PREVIEW: 'preview',
	VIEW_DETAIL: 'viewDetail',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type KioskSettingActionType = (typeof KIOSK_SETTING_ACTIONS)[keyof typeof KIOSK_SETTING_ACTIONS];

export type KioskSettingTableActions = {
	[key in KioskSettingActionType]?: (setting: KioskSetting, ...args: unknown[]) => void;
};

export interface KioskSettingTableProps extends AutoTableProps {
	actions: KioskSettingTableActions;
	pagination: TablePaginationProps;
}

export function getKioskSettingTableActions(
	setting: KioskSetting,
	actions: KioskSettingTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: KIOSK_SETTING_ACTIONS.PREVIEW,
			label: translate('action.preview'),
			icon: <IconLayoutSidebarRightExpand size={20} stroke={1.6} />,
			onClick: () => actions[KIOSK_SETTING_ACTIONS.PREVIEW]?.(setting),
			color: 'gray',
			active: !!actions[KIOSK_SETTING_ACTIONS.PREVIEW],
		},
		{
			key: KIOSK_SETTING_ACTIONS.VIEW_DETAIL,
			label: translate('action.viewDetails'),
			icon: <IconEye size={16} />,
			onClick: () => actions[KIOSK_SETTING_ACTIONS.VIEW_DETAIL]?.(setting),
			color: 'blue',
			active: !!actions[KIOSK_SETTING_ACTIONS.VIEW_DETAIL],
		},
		{
			key: KIOSK_SETTING_ACTIONS.ARCHIVE,
			label: translate('action.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[KIOSK_SETTING_ACTIONS.ARCHIVE]?.(setting),
			color: 'orange',
			active: !setting.isArchived && !!actions[KIOSK_SETTING_ACTIONS.ARCHIVE],
		},
		{
			key: KIOSK_SETTING_ACTIONS.RESTORE,
			label: translate('action.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[KIOSK_SETTING_ACTIONS.RESTORE]?.(setting),
			color: 'blue',
			active: !!setting.isArchived && !!actions[KIOSK_SETTING_ACTIONS.RESTORE],
		},
		{
			key: KIOSK_SETTING_ACTIONS.DELETE,
			label: translate('action.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[KIOSK_SETTING_ACTIONS.DELETE]?.(setting),
			color: 'red',
			active: !!actions[KIOSK_SETTING_ACTIONS.DELETE],
		},
	];
	return defaultActions.filter((action) => action.active);
}

function renderActionsHeader(
	_columnName: string,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta='end'>{translate('action.title')}</Text>;
}

export const KioskSettingTable: React.FC<KioskSettingTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		code: (row) => <TextCell content={row.code as string} />,
		name: (row) => (
			<NameCell link={row.id ? `../kiosk-settings/${row.id}` : undefined}>{row.name as string}</NameCell>
		),
		description: (row) => <TextCell content={String(row.description ?? '')} />,
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		actions: (row) => (
			<TableAction
				actions={
					getKioskSettingTableActions(row as unknown as KioskSetting, actions, translate)
				}
				overflowMenuLabel={translate('action.title')}
			/>
		),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		actions: (columnName) => renderActionsHeader(columnName, translate),
	};

	return (
		<Box pos='relative'>
			<TableContainer
				minWidth={500}
				footer={<TablePagination {...pagination} />}
			>
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
