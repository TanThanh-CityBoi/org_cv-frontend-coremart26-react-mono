import { snakeToCamelObject } from '@nikkierp/common/utils';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { SearchGraph } from '../../../types';
import { paymentService } from '../paymentService';
import { PaymentMethod } from '../types';


type SearchResponse = { items: PaymentMethod[], total: number };


export function usePaymentList(graph?: SearchGraph) {
	const { dispatchMethod, result } = useServiceLayer<SearchResponse>(paymentService.search);

	React.useEffect(() => {
		dispatchMethod(graph ? { graph } : {});
	}, [dispatchMethod, graph]);

	const handleRefresh = React.useCallback(() => {
		dispatchMethod(graph ? { graph } : {});
	}, [dispatchMethod, graph]);

	const payments = React.useMemo(
		() => (result.data?.items ?? []).map((item) => snakeToCamelObject(item) as PaymentMethod),
		[result.data?.items],
	);
	const isLoading = !payments.length && result.isPending;
	const isEmpty = !payments.length && !result.isPending && result.doneAt != null;

	return {
		payments,
		status: result.isPending ? 'pending' : 'success',
		isLoading,
		isEmpty,
		handleRefresh,
		/** Used by payment pickers (e.g. kiosk form) while the list request is in-flight or not yet loaded */
		isLoadingList: isLoading,
	};
}
