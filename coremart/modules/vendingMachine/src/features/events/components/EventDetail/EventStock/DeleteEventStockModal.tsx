import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type DeleteEventStockModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	productName: string,
	sku: string,
};

export const DeleteEventStockModal: React.FC<DeleteEventStockModalProps> = ({
	opened, onClose, onConfirm, productName, sku,
}) => {
	const { t: translate } = useTranslation('vending_machine');
	const line = `${productName} (SKU: ${sku})`;

	return (
		<ConfirmModal
			title={translate('messages.delete.confirm')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey='events.messages.delete_confirm'
					values={{ name: line }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('action.delete')}
			confirmColor='red'
		/>
	);
};
