import { Loader, Stack, Text } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useClientPagination } from '@/common/hooks';
import { kioskService } from '@/features/kiosks/kioskService';
import { Playlist } from '@/features/mediaPlaylist/types';
import { SearchGraph, SearchOperator } from '@/types';

import { MediaPlaylistKioskTable } from './MediaPlaylistKioskTable';
import { useRegisterMediaPlaylistDetailTab } from '../mediaPlaylistDetailTabControl';

import type { Kiosk } from '@/features/kiosks/types';


function buildPlaylistKioskSearchGraph(playlistId: string): SearchGraph {
	return {
		or: [
			{ if: ['shopping_screen_playlist_ref', SearchOperator.EQUAL, playlistId] },
			{ if: ['waiting_screen_playlist_ref', SearchOperator.EQUAL, playlistId] },
		],
	};
}

function usePlaylistKioskListData(playlistId: string) {
	const { t: translate } = useTranslation();
	const [items, setItems] = useState<Kiosk[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		setError(null);
		void kioskService
			.searchKiosks({
				page: 0,
				size: 500,
				graph: buildPlaylistKioskSearchGraph(playlistId),
			})
			.then((res) => {
				if (!cancelled) setItems(res.items ?? []);
			})
			.catch((e) => {
				if (!cancelled) {
					setError(
						e instanceof Error
							? e.message
							: translate('coremart.vendingMachine.mediaPlaylist.kioskList.loadError'),
					);
				}
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [playlistId, translate]);

	return { items, isLoading, error };
}

export const MediaPlaylistKioskListTab: React.FC<{ playlist: Playlist }> = ({ playlist }) => {
	const playlistId = playlist?.id;
	const { items, isLoading, error } = usePlaylistKioskListData(playlistId);

	const pagination = useClientPagination(items.length, { resetKey: playlistId });
	const { page, pageSize } = pagination;

	const paginatedRows = useMemo(() => {
		const start = (page - 1) * pageSize;
		return items.slice(start, start + pageSize) as unknown as Record<string, unknown>[];
	}, [items, page, pageSize]);


	useRegisterMediaPlaylistDetailTab('kiosks', []);

	if (isLoading) {
		return (
			<Stack align='center' py='xl'>
				<Loader />
			</Stack>
		);
	}

	if (error) {
		return <Text c='red' size='sm'>{error}</Text>;
	}

	return (
		<MediaPlaylistKioskTable
			data={paginatedRows}
			isLoading={false}
			pagination={pagination}
			playlistId={playlistId}
		/>
	);
};
