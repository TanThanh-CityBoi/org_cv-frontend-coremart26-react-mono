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

import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import {
	NameCell,
	TableAction,
	TableContainer,
	TextCell,
	type TableActionItem,
	TablePagination,
	type TablePaginationProps,
} from '../../../../components/Table';
import { deriveEventRunPhase, type Event } from '../../types';
import { EventRunPhaseBadge } from '../EventScheduleBadges';


const EVENT_ACTIONS = {
	PREVIEW: 'preview',
	VIEW_DETAIL: 'viewDetail',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type EventActionType = (typeof EVENT_ACTIONS)[keyof typeof EVENT_ACTIONS];

export type EventTableActions = {
	[key in EventActionType]?: (event: Event, ...args: unknown[]) => void;
};

export interface EventTableProps extends AutoTableProps {
	actions: EventTableActions;
	pagination: TablePaginationProps;
}

export function getEventTableActions(
	event: Event,
	actions: EventTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const archived = !!event.isArchived;

	const defaults: (TableActionItem & { active?: boolean })[] = [
		{
			key: EVENT_ACTIONS.PREVIEW,
			label: translate('action.preview'),
			icon: <IconLayoutSidebarRightExpand size={20} stroke={1.6} />,
			onClick: () => actions[EVENT_ACTIONS.PREVIEW]?.(event),
			color: 'gray',
			active: !!actions[EVENT_ACTIONS.PREVIEW],
		},
		{
			key: EVENT_ACTIONS.VIEW_DETAIL,
			label: translate('action.viewDetails'),
			icon: <IconEye size={16} />,
			onClick: () => actions[EVENT_ACTIONS.VIEW_DETAIL]?.(event),
			color: 'blue',
			active: !!actions[EVENT_ACTIONS.VIEW_DETAIL],
		},
		{
			key: EVENT_ACTIONS.ARCHIVE,
			label: translate('action.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[EVENT_ACTIONS.ARCHIVE]?.(event),
			color: 'orange',
			active: !archived && !!actions[EVENT_ACTIONS.ARCHIVE],
		},
		{
			key: EVENT_ACTIONS.RESTORE,
			label: translate('action.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[EVENT_ACTIONS.RESTORE]?.(event),
			color: 'blue',
			active: archived && !!actions[EVENT_ACTIONS.RESTORE],
		},
		{
			key: EVENT_ACTIONS.DELETE,
			label: translate('action.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[EVENT_ACTIONS.DELETE]?.(event),
			color: 'red',
			active: !!actions[EVENT_ACTIONS.DELETE],
		},
	];
	return defaults.filter((action) => action.active);
}

function renderActionsHeader(
	_columnName: string,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta='end'>{translate('action.title')}</Text>;
}

function renderDateCell(row: Record<string, unknown>, field: keyof Event | string) {
	const date = row[String(field)] as string;
	return (
		<Text size='sm'>{date ? new Date(date).toLocaleDateString() : '-'}</Text>
	);
}

export const EventTable: React.FC<EventTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const columnRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		code: (row) => <TextCell content={row.code as string} />,
		name: (row) => (
			<NameCell link={row.id ? `../events/${row.id}` : undefined}>{row.name as string}</NameCell>
		),
		description: (row) => (
			<Text
				component='span'
				display='inline-block'
				size='sm'
				maw={300}
				style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
			>
				{(row.description as string) ?? '—'}
			</Text>
		),
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		runPhase: (row) => (
			<EventRunPhaseBadge phase={deriveEventRunPhase(row as unknown as Pick<Event, 'startTime' | 'endTime'>)} />
		),
		startTime: (row) => renderDateCell(row, 'startTime'),
		endTime: (row) => renderDateCell(row, 'endTime'),
		actions: (row) => (
			<TableAction
				actions={getEventTableActions(row as unknown as Event, actions, translate)}
				overflowMenuLabel={translate('action.title')}
			/>
		),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		actions: (columnName) => renderActionsHeader(columnName, translate),
	};

	return (
		<Box pos='relative'>
			<TableContainer minWidth={500} footer={<TablePagination {...pagination} />}>
				<AutoTable
					translationNs='vending_machine'
					columns={columns}
					data={data}
					schema={schema}
					isLoading={isLoading}
					columnRenderers={columnRenderers}
					headerRenderers={headerRenderers}
					striped='even'
					highlightOnHover
					theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
				/>
			</TableContainer>
		</Box>
	);
};
