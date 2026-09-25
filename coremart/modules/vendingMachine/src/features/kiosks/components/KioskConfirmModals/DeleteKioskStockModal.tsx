import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type DeleteKioskStockModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	/** Product display name and SKU for the confirmation line */
	productName: string,
	sku: string,
};

export const DeleteKioskStockModal: React.FC<DeleteKioskStockModalProps> = ({
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
					i18nKey='kiosk.stocks.messages.delete_confirm'
					values={{ name: line }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('action.delete')}
			confirmColor='red'
		/>
	);
};
