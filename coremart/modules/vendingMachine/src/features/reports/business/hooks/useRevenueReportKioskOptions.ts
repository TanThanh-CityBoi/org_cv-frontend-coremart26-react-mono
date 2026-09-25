import { useDebouncedValue } from '@mantine/hooks';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { useEffect, useMemo } from 'react';

import { buildSimpleSearchGraph, type SimpleFilter } from '../../../../common/helpers';
import { ArchivedStatus } from '../../../../types';
import { kioskCrudService } from '../../../kiosks/kioskService';

import type { Kiosk } from '../../../kiosks/types';


/** Giống cột GET trong `KioskService.search` — chỉ cần id/code/name cho dropdown. */
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

export function useRevenueReportKioskOptions(searchQuery: string): Array<{ value: string, label: string }> {
	const { dispatchMethod, result } = useServiceLayer<{ items: Kiosk[] }>(kioskCrudService.search);
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

		dispatchMethod({
			fields: KIOSK_REPORT_PICKER_COLUMNS,
			page: 0,
			size: 20,
			graph: buildSimpleSearchGraph(filters),
		});
	}, [dispatchMethod, debounced]);

	return useMemo(
		() =>
			(result.data?.items ?? []).map((k: Kiosk) => ({
				value: k.id,
				label: k.name || k.code || k.id,
			})),
		[result.data?.items],
	);
}
