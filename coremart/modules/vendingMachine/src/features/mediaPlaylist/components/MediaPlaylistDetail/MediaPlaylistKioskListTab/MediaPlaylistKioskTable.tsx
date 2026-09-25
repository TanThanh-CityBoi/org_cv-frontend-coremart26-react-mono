import { Box, Text } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { NameCell, TableContainer, TablePagination, type TablePaginationProps, TextCell } from '@/components/Table';

import mediaPlaylistKioskListTableSchema from './mediaPlaylistKioskListTableSchema.json';

import type { Kiosk } from '@/features/kiosks/types';


const COLUMNS = ['code', 'name', 'screenAssignment'] as const;

function kioskPlaylistAssignmentLabel(
	kiosk: Kiosk,
	playlistId: string,
	translate: (key: string) => string,
): string {
	const shopping = kiosk.shoppingScreenPlaylistRef === playlistId;
	const waiting = kiosk.waitingScreenPlaylistRef === playlistId;
	if (shopping && waiting) {
		return translate('coremart.vendingMachine.mediaPlaylist.kioskList.usage.both');
	}
	if (shopping) {
		return translate('coremart.vendingMachine.mediaPlaylist.kioskList.usage.shopping');
	}
	return translate('coremart.vendingMachine.mediaPlaylist.kioskList.usage.waiting');
}

export type MediaPlaylistKioskTableProps = {
	data: Record<string, unknown>[];
	isLoading: boolean;
	pagination: TablePaginationProps;
	playlistId: string;
};

export const MediaPlaylistKioskTable: React.FC<MediaPlaylistKioskTableProps> = ({
	data,
	isLoading,
	pagination,
	playlistId,
}) => {
	const { t: translate } = useTranslation();

	const colRenderers: React.ComponentProps<typeof AutoTable>['columnRenderers'] = {
		name: (row) => (
			<NameCell link={row.id ? `../kiosks/${row.id as string}` : undefined}>
				{row.name as string}
			</NameCell>
		),
		code: (row) => <TextCell miw={100}>{row.code as string}</TextCell>,
		screenAssignment: (row) => (
			<Text size='sm' miw={100}>
				{kioskPlaylistAssignmentLabel(row as unknown as Kiosk, playlistId, translate)}
			</Text>
		),
	};

	return (
		<Box pos='relative'>
			<TableContainer footer={<TablePagination {...pagination} />}>
				<AutoTable
					columns={[...COLUMNS]}
					data={data}
					schema={mediaPlaylistKioskListTableSchema as ModelSchema}
					isLoading={isLoading}
					columnRenderers={colRenderers}
					striped='even'
					highlightOnHover
					theadProps={{ bg: 'var(--mantine-color-gray-0)' }}
				/>
			</TableContainer>
		</Box>
	);
};
