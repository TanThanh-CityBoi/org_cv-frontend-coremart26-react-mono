import { useServiceLayer } from '@nikkierp/ui/appState/store';
import React from 'react';

import { useMutationOutcome } from '../../../common/hooks/useMutationOutcome';
import { paymentService } from '../paymentService';
import { PaymentMethod } from '../types';


export interface UsePaymentDeleteProps {
	onDeleteSuccess?: () => void;
	onDeleteError?: () => void;
}


export const usePaymentDelete = ({
	onDeleteSuccess,
	onDeleteError,
}: UsePaymentDeleteProps = {
	onDeleteSuccess: () => {},
	onDeleteError: () => {},
}) => {
	const { dispatchMethod, result } = useServiceLayer(paymentService.delete);

	const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false);
	const [paymentToDelete, setPaymentToDelete] = React.useState<PaymentMethod | null>(null);

	const handleOpenDeleteModal = React.useCallback((paymentMethod: PaymentMethod) => {
		setPaymentToDelete(paymentMethod);
		setIsOpenDeleteModal(true);
	}, []);

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsOpenDeleteModal(false);
		setPaymentToDelete(null);
	}, []);

	const handleDelete = React.useCallback((paymentId: string) => {
		dispatchMethod({ id: paymentId });
	}, [dispatchMethod]);

	useMutationOutcome(result, {
		successKey: () => 'payment.messages.delete_success',
		errorKey: 'errors.deleteFailed',
		onSuccess: () => { handleCloseDeleteModal(); onDeleteSuccess?.(); },
		onError: () => { handleCloseDeleteModal(); onDeleteError?.(); },
	});

	return {
		handleDelete,
		handleOpenDeleteModal,
		handleCloseDeleteModal,
		isOpenDeleteModal,
		paymentToDelete,
	};
};

/** @deprecated Use usePaymentDelete */
export const usePaymentMethodDelete = usePaymentDelete;
