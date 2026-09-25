/* eslint-disable max-lines-per-function */
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { controlPanelToSearchGraph, type ControlPanelFilterConfig } from '../../../components';
import { ArchivedStatus, SearchNode, SearchOperator } from '../../../types';
import { ConnectionStatus, KioskMode } from '../types';


export function useKioskFilter() {
	const { t: translate } = useTranslation('vending_machine');
	const [searchValue, setSearchValue] = useState('');
	const [statusFilter, setStatusFilter] = useState<ArchivedStatus[]>([ArchivedStatus.ACTIVE]);
	const [connectionFilter, setConnectionFilter] = useState<ConnectionStatus[]>([]);
	const [modeFilter, setModeFilter] = useState<KioskMode[]>([]);

	const buildConnectionCondition = useCallback((): SearchNode[] | null => {
		if (connectionFilter.length === 0 || connectionFilter.length === 3) return null;

		const lastPingKey = 'connection.last_ping';
		const lastStatusKey = 'connection.last_status';

		const currentTime = new Date();
		const recentThreshold = 5 * 60_000; // 5 minutes
		const recentTime = new Date(currentTime.getTime() - recentThreshold);

		const connectedCondition: SearchNode = {
			if: [lastPingKey, SearchOperator.GREATER_THAN_OR_EQUAL, recentTime.toISOString()],
		};
		const lostCondition: SearchNode = {
			or:[
				{ if: [lastPingKey, SearchOperator.LESS_THAN, recentTime.toISOString()] },
				{ if: ['connection.last_status', SearchOperator.IS_NOT_SET, true] },
			],
		};

		const slowCondition: SearchNode = {
			if: [lastStatusKey, SearchOperator.EQUAL, ConnectionStatus.SLOW],
		};
		const fastCondition: SearchNode = {
			if: [lastStatusKey, SearchOperator.EQUAL, ConnectionStatus.FAST],
		};

		const nodes: SearchNode[] = [];
		if (connectionFilter.includes(ConnectionStatus.FAST)) {
			nodes.push({ and: [connectedCondition, fastCondition] });
		}
		if (connectionFilter.includes(ConnectionStatus.SLOW)) {
			nodes.push({ and: [connectedCondition, slowCondition] });
		}
		if (connectionFilter.includes(ConnectionStatus.LOST)) {
			nodes.push(lostCondition);
		}

		return nodes.length === 1 ? nodes : [{ or: nodes }];
	}, [connectionFilter]);

	const filters: ControlPanelFilterConfig[] = useMemo(() => [
		{
			key: 'search',
			searchFields: ['code', 'name'],
			type: 'search' as const,
			value: searchValue,
			onChange: setSearchValue,
			placeholder: translate('kiosk.search.placeholder'),
		},
		{
			key: 'isArchived',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setStatusFilter,
			options: [
				{ value: ArchivedStatus.ACTIVE, label: translate('status.active') },
				{ value: ArchivedStatus.ARCHIVED, label: translate('status.archived') },
			],
			placeholder: translate('kiosk.filter.status'),
			getGraphValue: (value: ArchivedStatus[]) => value.map((v) => v === ArchivedStatus.ARCHIVED),
		},
		{
			key: 'connection',
			type: 'multiSelect' as const,
			value: connectionFilter,
			onChange: (value: ConnectionStatus[]) => setConnectionFilter(value),
			options: [
				{ value: ConnectionStatus.FAST, label: translate('kiosk.connection_status.fast') },
				{ value: ConnectionStatus.SLOW, label: translate('kiosk.connection_status.slow') },
				{ value: ConnectionStatus.LOST, label: translate('kiosk.connection_status.lost') },
			],
			placeholder: translate('kiosk.filter.connection'),
			getCondition: buildConnectionCondition,
		},
		{
			key: 'mode',
			type: 'multiSelect' as const,
			value: modeFilter,
			onChange: setModeFilter,
			options: [
				{ value: KioskMode.PENDING, label: translate('kiosk.mode.pending') },
				{ value: KioskMode.SELLING, label: translate('kiosk.mode.selling') },
				{ value: KioskMode.SLIDESHOW_ONLY, label: translate('kiosk.mode.slideshow_only') },
			],
			placeholder: translate('kiosk.filter.mode'),
		},
	], [searchValue, statusFilter, connectionFilter, modeFilter, translate]);

	const graph = useMemo(
		() => controlPanelToSearchGraph(filters),
		[filters],
	);

	return { filters, graph };
}
