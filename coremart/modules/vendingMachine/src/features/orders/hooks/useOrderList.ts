/* eslint-disable max-lines-per-function */

import { DatesRangeValue } from '@mantine/dates';
import { DateValue } from '@mantine/dates';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VendingMachineDispatch, selectVendingOrderList, vendingOrderActions } from '@/appState';
import { usePagination } from '@/common/hooks';
import { controlPanelToSearchGraph } from '@/components';
import { type ControlPanelFilterConfig } from '@/components';
import { SearchGraph } from '@/types';

import { ORDER_STATUSES, PAYMENT_METHODS, VdOrder, VdOrderStatus, VdPaymentMethod } from '../types';


export function useOrderList(graph?: SearchGraph) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const list = useMicroAppSelector(selectVendingOrderList);

	const fetchList = useCallback((targetPage: number, size: number, searchGraph?: SearchGraph) => {
		dispatch(vendingOrderActions.listOrders({
			page: targetPage - 1,
			size,
			graph: searchGraph,
		}));
	}, [dispatch]);

	const pagination = usePagination(fetchList, selectVendingOrderList, { graph });
	const { page, pageSize } = pagination;

	React.useEffect(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const handleRefresh = useCallback(() => {
		fetchList(page, pageSize, graph);
	}, [fetchList, page, pageSize, graph]);

	const orders = list.items ?? [];
	const status = list.status;
	const isLoading = !orders.length && (status === 'pending' || status === 'idle');
	const isEmpty = !orders.length && status !== 'idle' && status !== 'pending';

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
	const { t: translate } = useTranslation();
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
				placeholder: translate('coremart.vendingMachine.orders.search.placeholder'),
			},
			{
				key: 'createdAt',
				type: 'dateRange' as const,
				value: dateRange,
				onChange: handleDateChange,
				placeholder: translate('coremart.vendingMachine.common.datePicker.selectDateRange'),
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
					label: translate(`coremart.vendingMachine.orders.orderStatus.${s}`),
				})),
				placeholder: translate('coremart.vendingMachine.orders.filter.orderStatus'),
				clearable: true,
			},
			{
				key: 'paymentMethod',
				type: 'multiSelect' as const,
				value: paymentMethod,
				onChange: setPaymentMethod,
				options: PAYMENT_METHODS.map((p) => ({
					value: p,
					label: translate(`coremart.vendingMachine.orders.paymentMethod.${p}`),
				})),
				placeholder: translate('coremart.vendingMachine.orders.filter.paymentMethod'),
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
