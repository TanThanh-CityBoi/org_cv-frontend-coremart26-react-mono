/* eslint-disable max-lines-per-function */
import { useUIState } from '@nikkierp/shell/contexts';
import { ReduxActionState } from '@nikkierp/ui/appState';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	selectRefundOrderItemsState,
	VendingMachineDispatch,
	vendingOrderActions,
} from '@/appState';

import type { VdRefundOrderItemsBody } from '../types';


export interface UseOrderRefundProps {
	onSuccess?: () => void;
	onError?: () => void;
	/** Runs after refund success notifications and before Redux reset — e.g. clear modal UI + call parent `onClose`. */
	onRefundSuccessModalClose?: () => void;
}

function useRefundOutcomeSync(
	refundState: ReduxActionState,
	dispatchedRequestIdRef: React.RefObject<string | null>,
	pendingOrderIdRef: React.RefObject<string | null>,
	dispatch: VendingMachineDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	onRefundSuccessModalClose: () => void,
	onRefundSuccess: () => void,
	onRefundError: () => void,
) {
	React.useEffect(() => {
		const requestId = refundState.requestId;
		const matchesDispatch = requestId != null && dispatchedRequestIdRef.current === requestId;
		if (!matchesDispatch) return;

		if (refundState.status === 'success') {
			dispatchedRequestIdRef.current = null;
			const orderId = pendingOrderIdRef.current;
			pendingOrderIdRef.current = null;
			notification.showInfo(
				translate('coremart.vendingMachine.orders.refund.success_message'),
				translate('coremart.vendingMachine.orders.refund.success_title'),
			);
			onRefundSuccessModalClose();
			if (orderId) {
				dispatch(vendingOrderActions.getOrder({ id: orderId }));
			}
			onRefundSuccess();
			dispatch(vendingOrderActions.resetRefundOrderItems());
			return;
		}

		if (refundState.status === 'error') {
			dispatchedRequestIdRef.current = null;
			pendingOrderIdRef.current = null;
			notification.showError(
				refundState.error ?? translate('coremart.vendingMachine.orders.refund.error_message'),
				translate('coremart.vendingMachine.orders.refund.error_title'),
			);
			onRefundError();
			dispatch(vendingOrderActions.resetRefundOrderItems());
		}
	}, [
		refundState,
		dispatch,
		notification,
		translate,
		onRefundSuccessModalClose,
		onRefundSuccess,
		onRefundError,
		dispatchedRequestIdRef,
		pendingOrderIdRef,
	]);
}

export const useOrderRefund = ({
	onSuccess = () => {},
	onError = () => {},
	onRefundSuccessModalClose = () => {},
}: UseOrderRefundProps = {}) => {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const dispatchedRefundRequestIdRef = React.useRef<string | null>(null);
	const pendingRefundOrderIdRef = React.useRef<string | null>(null);
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const refundState = useMicroAppSelector(selectRefundOrderItemsState);

	const matchesDispatch =
		refundState.requestId != null
		&& dispatchedRefundRequestIdRef.current === refundState.requestId;
	const isRefundPending =
		matchesDispatch && refundState.status === 'pending';

	const handleRefundOrderItemsSubmit = React.useCallback(
		(orderId: string, body: VdRefundOrderItemsBody) => {
			pendingRefundOrderIdRef.current = orderId;
			const pendingAction = dispatch(
				vendingOrderActions.refundOrderItems({ orderId, body }),
			);
			dispatchedRefundRequestIdRef.current = pendingAction.requestId;
		},
		[dispatch],
	);

	useRefundOutcomeSync(
		refundState,
		dispatchedRefundRequestIdRef,
		pendingRefundOrderIdRef,
		dispatch,
		notification,
		translate,
		onRefundSuccessModalClose,
		onSuccess,
		onError,
	);

	return {
		handleRefundOrderItemsSubmit,
		isRefundPending,
	};
};
