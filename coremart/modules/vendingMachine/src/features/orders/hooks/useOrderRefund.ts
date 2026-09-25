import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { orderCrudService } from '../orderService';

import type { VdRefundOrderItemsBody } from '../types';


export interface UseOrderRefundProps {
	onSuccess?: () => void;
	onError?: () => void;
	/** Runs after the refund notification and before the order refetch — e.g. close the modal. */
	onRefundSuccessModalClose?: () => void;
}

export const useOrderRefund = ({
	onSuccess = () => {},
	onError = () => {},
	onRefundSuccessModalClose = () => {},
}: UseOrderRefundProps = {}) => {
	const { dispatchMethod, result } = useServiceLayer(orderCrudService.refundItems);
	const { dispatchMethod: reloadOrder } = useServiceLayer(orderCrudService.getDetail);
	// Which order the in-flight refund was for; the response body does not say.
	const pendingOrderIdRef = React.useRef<string | null>(null);

	const handleRefundOrderItemsSubmit = React.useCallback(
		(orderId: string, body: VdRefundOrderItemsBody) => {
			pendingOrderIdRef.current = orderId;
			dispatchMethod({ orderId, body });
		},
		[dispatchMethod],
	);

	useMutationOutcome(result, {
		successKey: () => 'orders.refund.success_message',
		errorKey: 'orders.refund.error_message',
		// Refund has its own notification headings, not the generic success/error ones.
		successTitleKey: 'orders.refund.success_title',
		errorTitleKey: 'orders.refund.error_title',
		onSuccess: () => {
			const orderId = pendingOrderIdRef.current;
			pendingOrderIdRef.current = null;
			onRefundSuccessModalClose();
			if (orderId) {
				reloadOrder({ id: orderId });
			}
			onSuccess();
		},
		onError: () => { pendingOrderIdRef.current = null; onError(); },
	});

	return {
		handleRefundOrderItemsSubmit,
		isRefundPending: result.isPending,
	};
};
