import { Box, Text } from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import mediaPlaylistKioskListTableSchema from './mediaPlaylistKioskListTableSchema.json';
import { asLegacyModelSchema } from '../../../../../common/helpers';
import { NameCell, TableContainer, TablePagination, type TablePaginationProps, TextCell } from '../../../../../components/Table';


import type { Kiosk } from '../../../../kiosks/types';


const COLUMNS = ['code', 'name', 'screenAssignment'] as const;

function kioskPlaylistAssignmentLabel(
	kiosk: Kiosk,
	playlistId: string,
	translate: (key: string) => string,
): string {
	const shopping = kiosk.shoppingScreenPlaylistRef === playlistId;
	const waiting = kiosk.waitingScreenPlaylistRef === playlistId;
	if (shopping && waiting) {
		return translate('media_playlist.kiosk_list.usage.both');
	}
	if (shopping) {
		return translate('media_playlist.kiosk_list.usage.shopping');
	}
	return translate('media_playlist.kiosk_list.usage.waiting');
}

export type MediaPlaylistKioskTableProps = {
	data: Record<string, unknown>[],
	isLoading: boolean,
	pagination: TablePaginationProps,
	playlistId: string,
};

export const MediaPlaylistKioskTable: React.FC<MediaPlaylistKioskTableProps> = ({
	data,
	isLoading,
	pagination,
	playlistId,
}) => {
	const { t: translate } = useTranslation('vending_machine');

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
					translationNs='vending_machine'
					columns={[...COLUMNS]}
					data={data}
					schema={asLegacyModelSchema(mediaPlaylistKioskListTableSchema)}
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
