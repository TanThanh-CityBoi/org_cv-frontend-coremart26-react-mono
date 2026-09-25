import { Box, Text } from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconArchive, IconEye, IconLayoutSidebarRightExpand, IconRestore, IconTrash } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';



import { ArchivedStatusBadge } from '../../../../components/ArchivedStatusBadge';
import { NameCell, TableAction, TableContainer, TablePagination, type TableActionItem, TextCell } from '../../../../components/Table';
import { type TablePaginationProps } from '../../../../components/Table';

import type { KioskMedia, Playlist } from '../../types';



const MEDIA_PLAYLIST_ACTIONS = {
	PREVIEW: 'preview',
	VIEW_DETAIL: 'viewDetail',
	ARCHIVE: 'archive',
	RESTORE: 'restore',
	DELETE: 'delete',
} as const;
type MediaPlaylistActionType = (typeof MEDIA_PLAYLIST_ACTIONS)[keyof typeof MEDIA_PLAYLIST_ACTIONS];

export type MediaPlaylistTableActions = {
	[key in MediaPlaylistActionType]?: (playlist: Playlist, ...args: unknown[]) => void;
};

export function getMediaPlaylistTableActions(
	playlist: Playlist,
	actions: MediaPlaylistTableActions,
	translate: TFunction,
): TableActionItem[] {
	if (Object.keys(actions).length === 0) return [];

	const defaultActions: (TableActionItem & { active?: boolean })[] = [
		{
			key: MEDIA_PLAYLIST_ACTIONS.PREVIEW,
			label: translate('action.preview'),
			icon: <IconLayoutSidebarRightExpand size={20} stroke={1.6} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.PREVIEW]?.(playlist),
			color: 'gray',
			active: !!actions[MEDIA_PLAYLIST_ACTIONS.PREVIEW],
		},
		{
			key: MEDIA_PLAYLIST_ACTIONS.VIEW_DETAIL,
			label: translate('action.viewDetails'),
			icon: <IconEye size={16} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.VIEW_DETAIL]?.(playlist),
			color: 'blue',
			active: !!actions[MEDIA_PLAYLIST_ACTIONS.VIEW_DETAIL],
		},
		{
			key: MEDIA_PLAYLIST_ACTIONS.ARCHIVE,
			label: translate('action.archive'),
			icon: <IconArchive size={16} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.ARCHIVE]?.(playlist),
			color: 'orange',
			active: !playlist.isArchived && !!actions[MEDIA_PLAYLIST_ACTIONS.ARCHIVE],
		},
		{
			key: MEDIA_PLAYLIST_ACTIONS.RESTORE,
			label: translate('action.restore'),
			icon: <IconRestore size={16} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.RESTORE]?.(playlist),
			color: 'blue',
			active: !!playlist.isArchived && !!actions[MEDIA_PLAYLIST_ACTIONS.RESTORE],
		},
		{
			key: MEDIA_PLAYLIST_ACTIONS.DELETE,
			label: translate('action.delete'),
			icon: <IconTrash size={16} />,
			onClick: () => actions[MEDIA_PLAYLIST_ACTIONS.DELETE]?.(playlist),
			color: 'red',
			active: !!actions[MEDIA_PLAYLIST_ACTIONS.DELETE],
		},
	];
	return defaultActions.filter((action) => action.active);
}

function renderActionsHeader(
	_columnName: string,
	_schema: unknown,
	translate: (key: string) => string,
) {
	return <Text fw={600} fz='sm' ta={'end'}>{translate('action.title')}</Text>;
}

export interface MediaPlaylistTableProps extends AutoTableProps {
	actions: MediaPlaylistTableActions;
	pagination: TablePaginationProps;
}

export const MediaPlaylistTable: React.FC<MediaPlaylistTableProps> = ({
	data,
	schema,
	columns,
	isLoading,
	actions,
	pagination,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		name: (row) => (
			<NameCell
				content={row.name as string}
				link={row.id ? `../media-playlist/playlists/${row.id as string}` : undefined}
			/>
		),
		isArchived: (row) => <ArchivedStatusBadge isArchived={!!row.isArchived} />,
		mediaItems: (row) => {
			const playlist = row as unknown as Playlist;
			return <TextCell content={playlist.mediaItems?.map((media: KioskMedia) => media.name).join(', ') ?? '—'} />;
		},
		actions: (row) => (
			<TableAction
				actions={getMediaPlaylistTableActions(row as unknown as Playlist, actions, translate)}
				overflowMenuLabel={translate('action.title')}
			/>
		),
	};

	const headerRenderers: React.ComponentProps<typeof AutoTable>['headerRenderers'] = {
		actions: (columnName) => renderActionsHeader(columnName, undefined, translate),
	};

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
