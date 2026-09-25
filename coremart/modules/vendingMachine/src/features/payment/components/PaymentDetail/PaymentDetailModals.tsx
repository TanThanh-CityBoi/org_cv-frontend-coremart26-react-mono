import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { UsePaymentDetailPageConfigReturn } from './hooks/types';
import type { PaymentMethod } from '../../types';



type ModalProps = Pick<
	UsePaymentDetailPageConfigReturn,
	| 'closeDeleteModal'
	| 'confirmDelete'
	| 'isOpenDeleteModal'
	| 'isOpenArchiveModal'
	| 'pendingArchive'
	| 'handleConfirmArchive'
	| 'handleCloseArchiveModal'
> & { payment: PaymentMethod };

export const PaymentDetailModals: React.FC<ModalProps> = ({
	payment,
	closeDeleteModal,
	confirmDelete,
	isOpenDeleteModal,
	isOpenArchiveModal,
	pendingArchive,
	handleConfirmArchive,
	handleCloseArchiveModal,
}) => {
	const { t } = useTranslation('vending_machine');

	return (
		<>
			<ConfirmModal
				title={t('messages.delete.confirm')}
				opened={isOpenDeleteModal}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				message={
					<Trans
						i18nKey='payment.messages.delete_confirm'
						values={{ name: payment.name }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={t('action.delete')}
				confirmColor='red'
			/>

			<ConfirmModal
				opened={isOpenArchiveModal}
				onClose={handleCloseArchiveModal}
				onConfirm={handleConfirmArchive}
				title={pendingArchive?.targetArchived
					? t('payment.messages.archive_modal_title')
					: t('payment.messages.restore_modal_title')}
				message={
					<Trans
						i18nKey={pendingArchive?.targetArchived
							? 'payment.messages.archive_confirm'
							: 'payment.messages.restore_confirm'}
						values={{ name: pendingArchive?.payment?.name || '' }}
						components={{ strong: <strong /> }}
					/>
				}
				confirmLabel={pendingArchive?.targetArchived
					? t('action.archive')
					: t('action.restore')}
				confirmColor={pendingArchive?.targetArchived ? 'orange' : 'blue'}
			/>
		</>
	);
};
