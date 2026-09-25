import { DateValue, DatesRangeValue } from '@mantine/dates';
import { IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import React, { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { appendSearchGraphAndCondition } from '../../../common/helpers';
import { BreadcrumbItem } from '../../../components/BreadCrumbs';
import { ControlPanelActionItem } from '../../../components/ControlPanel';
import { SearchGraph, SearchOperator } from '../../../types';
import { useOrderFilter, useOrderList } from '../hooks';


type OrderPageContextValue = {
	filter: ReturnType<typeof useOrderFilter>,
	list: ReturnType<typeof useOrderList>,
};

const OrderPageContext = createContext<OrderPageContextValue | null>(null);

export type OrderPageProviderProps = React.PropsWithChildren<{
	/** Restricts orders to this kiosk_ref (API id). */
	kioskRefFilter?: string | null,
	/** Applied once at parent level (e.g. revenue kiosk detail); AND with user filters. */
	appliedDateRange?: DatesRangeValue<DateValue> | undefined,
}>;

function mergeOrderListGraph(
	baseGraph: SearchGraph | undefined,
	kioskRefFilter: string | null | undefined,
	appliedDateRange: DatesRangeValue<DateValue> | undefined,
): SearchGraph | undefined {
	let graph: SearchGraph | undefined = baseGraph;
	if (kioskRefFilter) {
		graph = appendSearchGraphAndCondition(graph, {
			if: ['kiosk_ref', SearchOperator.EQUAL, kioskRefFilter],
		});
	}
	const [from, to] = appliedDateRange ?? [null, null];
	if (from) {
		graph = appendSearchGraphAndCondition(graph, {
			if: ['created_at', SearchOperator.GREATER_THAN_OR_EQUAL, dayjs(from).startOf('day').toISOString()],
		});
	}
	if (to) {
		graph = appendSearchGraphAndCondition(graph, {
			if: ['created_at', SearchOperator.LESS_THAN_OR_EQUAL, dayjs(to).endOf('day').toISOString()],
		});
	}
	return graph;
}

export function OrderPageProvider(props: OrderPageProviderProps) {
	const { kioskRefFilter = null, appliedDateRange, children } = props;
	const filter = useOrderFilter();
	const mergedGraph = useMemo(
		() => mergeOrderListGraph(filter.graph, kioskRefFilter, appliedDateRange),
		[filter.graph, kioskRefFilter, appliedDateRange],
	);
	const list = useOrderList(mergedGraph);

	const value = useMemo(
		() => ({ filter, list }),
		[filter, list],
	);

	return <OrderPageContext.Provider value={value}>{children}</OrderPageContext.Provider>;
}

export function useOrderPageContext() {
	const ctx = useContext(OrderPageContext);
	if (!ctx) {
		throw new Error('useOrderPageContext must be used within OrderPageProvider');
	}
	return ctx;
}

export function useOrderPageConfig(): { breadcrumbs: BreadcrumbItem[], actions: ControlPanelActionItem[] } {
	const { list: { handleRefresh } } = useOrderPageContext();
	const { t: translate } = useTranslation('vending_machine');

	return useMemo(
		() => ({
			breadcrumbs: [
				{ title: translate('title'), href: '../overview' },
				{ title: translate('menu.orders'), href: '#' },
			],
			actions: [
				{
					label: translate('action.refresh'),
					leftSection: <IconRefresh size={16} />,
					onClick: handleRefresh,
					variant: 'outline' as const,
				},
			],
		}),
		[handleRefresh, translate],
	);
}
