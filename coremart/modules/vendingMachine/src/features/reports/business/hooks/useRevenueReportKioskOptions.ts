import { useDebouncedValue } from '@mantine/hooks';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useEffect, useMemo } from 'react';

import {
	type VendingMachineDispatch,
	kioskActions,
	selectKioskList,
} from '@/appState';
import { buildSimpleSearchGraph, type SimpleFilter } from '@/common/helpers';
import { ArchivedStatus } from '@/types';

import type { Kiosk } from '@/features/kiosks/types';


/** Giống cột GET trong {@link kioskActions.listKiosks} — chỉ cần id/code/name cho dropdown. */
const KIOSK_REPORT_PICKER_COLUMNS: Array<keyof Kiosk> = [
	'id',
	'etag',
	'code',
	'name',
	'isArchived',
	'mode',
	'uiMode',
	'locationAddress',
	'latitude',
	'longitude',
	'createdAt',
	'updatedAt',
];

/** Giống trang kiosk: chỉ kiosk đang active (không archive). */

export function useRevenueReportKioskOptions(searchQuery: string): Array<{ value: string; label: string }> {
	const dispatch = useMicroAppDispatch() as VendingMachineDispatch;
	const list = useMicroAppSelector(selectKioskList);
	const [debounced] = useDebouncedValue(searchQuery.trim(), 300);

	useEffect(() => {
		const filters: SimpleFilter[] = [];
		if (debounced) {
			filters.push({
				key: 'search',
				type: 'search',
				value: debounced,
				searchFields: ['code', 'name'],
			});
		}
		filters.push({
			key: 'isArchived',
			type: 'multiSelect',
			value: [ArchivedStatus.ACTIVE],
			getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
		});

		dispatch(kioskActions.listKiosks({
			fields: KIOSK_REPORT_PICKER_COLUMNS,
			page: 0,
			size: 20,
			graph: buildSimpleSearchGraph(filters),
		}));
	}, [dispatch, debounced]);

	return useMemo(
		() =>
			(list.items ?? []).map((k: Kiosk) => ({
				value: k.id,
				label: k.name || k.code || k.id,
			})),
		[list.items],
	);
}
