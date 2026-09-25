/* eslint-disable max-lines-per-function */

import { DatesRangeValue } from '@mantine/dates';
import { DateValue } from '@mantine/dates';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePaginationWithTotal } from '../../../common/hooks';
import { controlPanelToSearchGraph } from '../../../components';
import { type ControlPanelFilterConfig } from '../../../components';
import { SearchGraph } from '../../../types';
// The enum, not the `'asc' | 'desc'` type alias the `@/types` barrel re-exports under the same name.
import { SortDirection } from '../../../types/search-graph';
import { orderCrudService } from '../orderService';
import { ORDER_STATUSES, PAYMENT_METHODS, VdOrder, VdOrderStatus, VdPaymentMethod } from '../types';


type SearchResponse = { items: VdOrder[], total: number };

export function useOrderList(graph?: SearchGraph) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(orderCrudService.search);

	const fetchList = useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatchMethod({
			page: targetPage - 1,
			size,
			graph: { order: [['created_at', SortDirection.DESC]], ...(searchGraph ?? {}) },
		});
	}, [dispatchMethod]);

	const pagination = usePaginationWithTotal(fetchList, result.data?.total ?? 0, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const orders = result.data?.items ?? [];
	const status = result.isPending ? 'pending' : 'success';
	const isLoading = !orders.length && (result.isPending || result.doneAt == null);
	const isEmpty = !orders.length && !result.isPending && result.doneAt != null;

	return {
		orders,
		status,
		isLoading,
		isEmpty,
		handleRefresh,
		pagination,
	};
}

export function useOrderFilter() {
	const { t: translate } = useTranslation('vending_machine');
	const [searchValue, setSearchValue] = useState('');
	const [orderStatus, setOrderStatus] = useState<VdOrderStatus[]>([]);
	const [paymentMethod, setPaymentMethod] = useState<VdPaymentMethod[]>([]);
	const [createdFrom, setCreatedFrom] = useState<string | null>(null);
	const [createdTo, setCreatedTo] = useState<string | null>(null);

	const [dateRange, setDateRange] = useState<DatesRangeValue<DateValue> | undefined>([null, null]);
	const handleDateChange = (value: DatesRangeValue<DateValue> | undefined) => {
		setDateRange(value);
	};

	const filters: ControlPanelFilterConfig[] = useMemo(
		() => [
			{
				key: 'search',
				type: 'search' as const,
				value: searchValue,
				onChange: setSearchValue,
				searchFields: ['orderCode', 'gatewayRefCode'],
				placeholder: translate('orders.search.placeholder'),
			},
			{
				key: 'createdAt',
				type: 'dateRange' as const,
				value: dateRange,
				onChange: handleDateChange,
				placeholder: translate('common.date_picker.select_date_range'),
				clearable: true,
				valueFormat: 'DD/MM/YYYY',
				// disabled: true,
			},
			{
				key: 'status',
				type: 'multiSelect' as const,
				value: orderStatus,
				onChange: setOrderStatus,
				options: ORDER_STATUSES.map((s) => ({
					value: s,
					label: translate(`orders.order_status.${s}`),
				})),
				placeholder: translate('orders.filter.order_status'),
				clearable: true,
			},
			{
				key: 'paymentMethod',
				type: 'multiSelect' as const,
				value: paymentMethod,
				onChange: setPaymentMethod,
				options: PAYMENT_METHODS.map((p) => ({
					value: p,
					label: translate(`orders.payment_method.${p}`),
				})),
				placeholder: translate('orders.filter.payment_method'),
				clearable: true,
			},

		],
		[searchValue, orderStatus, paymentMethod, translate, dateRange],
	);

	const graph = useMemo(() => controlPanelToSearchGraph(filters), [filters]);

	return {
		filters,
		graph,
		createdFrom,
		setCreatedFrom,
		createdTo,
		setCreatedTo,
	};
}

export type { VdOrder };
