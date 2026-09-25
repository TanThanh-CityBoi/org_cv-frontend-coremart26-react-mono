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

import { AddressLink } from '../../../../components/Address';
import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { KioskConnectionStatus } from '../../../../components/KioskConnectionStatus';
import { KioskModeStatusBadge } from '../../../../components/KioskModeStatusBadge';
import {
	KioskStateCurrent,
	KioskStateEnergy,
	KioskStateHumidity,
	KioskStateOutputDoorSwitch,
	KioskStateOutputSwitch,
	KioskStatePower,
	KioskStateTemperature,
} from '../../../../components/KioskState';
import { KioskWarning } from '../../../../components/KioskWarning';
import { NameCell, TableAction, TableContainer, TablePagination, type TableActionItem, TextCell } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';
import { Kiosk, KioskConnection, KioskMode } from '../../types';


const KIOSK_ACTIONS = {
	// VIEW: 'view',
	// EDIT: 'edit',
	PREVIEW: 'preview',
	VIEW_DETAIL: 'viewDetail',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type KioskActionType = (typeof KIOSK_ACTIONS)[keyof typeof KIOSK_ACTIONS];

export type KioskTableActions = {
	[key in KioskActionType]?: (kiosk: Kiosk, ...args: unknown[]) => void;
};
export interface KioskTableProps extends AutoTableProps {
	actions: KioskTableActions;
	pagination: TablePaginationProps;
}

export function getKioskTableActions(
	kiosk: Kiosk,
	actions: KioskTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: KIOSK_ACTIONS.PREVIEW,
			label: translate('action.preview'),
			icon: <IconLayoutSidebarRightExpand size={20} stroke={1.6} />,
			onClick: () => actions[KIOSK_ACTIONS.PREVIEW]?.(kiosk),
			color: 'gray',
			active: !!actions[KIOSK_ACTIONS.PREVIEW],
		},
		{
			key: KIOSK_ACTIONS.VIEW_DETAIL,
			label: translate('action.viewDetails'),
			icon: <IconEye size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.VIEW_DETAIL]?.(kiosk),
			color: 'blue',
			active: !!actions[KIOSK_ACTIONS.VIEW_DETAIL],
		},
		{
			key: KIOSK_ACTIONS.ARCHIVE,
			label: translate('action.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.ARCHIVE]?.(kiosk),
			color: 'orange',
			active: !kiosk.isArchived && !!actions[KIOSK_ACTIONS.ARCHIVE],
		},
		{
			key: KIOSK_ACTIONS.RESTORE,
			label: translate('action.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.RESTORE]?.(kiosk),
			color: 'blue',
			active: !!kiosk.isArchived && !!actions[KIOSK_ACTIONS.RESTORE],
		},
		{
			key: KIOSK_ACTIONS.DELETE,
			label: translate('action.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[KIOSK_ACTIONS.DELETE]?.(kiosk),
			color: 'red',
			active: !!actions[KIOSK_ACTIONS.DELETE],
		},
	];
	return defaultActions.filter((action) => action.active);
}

function renderActionsHeader(
	_columnName: string,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta={'end'}>{translate('action.title')}</Text>;
}

export const KioskTable: React.FC<KioskTableProps> = ({
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
		name: (row) => <NameCell link={row.id ? `../kiosks/${row.id}` : undefined} >{row.name as string}</NameCell>,
		locationAddress: (row) => <AddressLink
			address={row.locationAddress as string}
			latitude={String(row.latitude) || undefined}
			longitude={String(row.longitude) || undefined}
		/>,
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		mode: (row) => <KioskModeStatusBadge mode={row.mode as KioskMode} />,
		connectionStatus: (row) => <KioskConnectionStatus connections={
			(row?.connection as KioskConnection)?.history ?? []}
		/>,
		warnings: (row) => <KioskWarning warnings={row.warnings as Kiosk['warnings']} />,
		stateTemperature: (row) => <KioskStateTemperature kiosk={row as unknown as Kiosk} />,
		stateHumidity: (row) => <KioskStateHumidity kiosk={row as unknown as Kiosk} />,
		stateCurrent: (row) => <KioskStateCurrent kiosk={row as unknown as Kiosk} />,
		stateEnergy: (row) => <KioskStateEnergy kiosk={row as unknown as Kiosk} />,
		statePower: (row) => <KioskStatePower kiosk={row as unknown as Kiosk} />,
		stateOutputDoorSwitch: (row) => <KioskStateOutputDoorSwitch kiosk={row as unknown as Kiosk} />,
		stateOutputSwitch: (row) => <KioskStateOutputSwitch kiosk={row as unknown as Kiosk} />,
		actions: (row) => (
			<TableAction
				actions={getKioskTableActions( row as unknown as Kiosk, actions, translate)}
				overflowMenuLabel={translate('action.title')}
			/>
		),
	};
	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		actions: (columnName) => renderActionsHeader(columnName, translate),
	};

	return (
		<Box pos='relative'>
			<TableContainer minWidth={1200} footer={<TablePagination {...pagination} />}>
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
