import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { orderCrudService } from '../orderService';
import { VdOrder } from '../types';


type UseOrderDetailProps = {
	id?: string,
	orderCode?: string,
};

export function useOrderDetail({ id, orderCode }: UseOrderDetailProps): {
	order: VdOrder | undefined, isLoading: boolean,
} {
	const { dispatchMethod, result } = useServiceLayer<VdOrder>(orderCrudService.getDetail);

	React.useEffect(() => {
		if (id) {
			dispatchMethod({ id });
		}
		else if (orderCode) {
			dispatchMethod({ orderCode });
		}
	}, [id, orderCode, dispatchMethod]);

	return {
		// `useServiceLayer` yields `null` before the first call; consumers expect `undefined`.
		order: result.data ?? undefined,
		isLoading: result.isPending || result.doneAt == null,
	};
}
