import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type DeleteKioskModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	/** Name shown in the confirmation message */
	name: string,
};

export const DeleteKioskModal: React.FC<DeleteKioskModalProps> = ({
	opened,
	onClose,
	onConfirm,
	name,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	return (
		<ConfirmModal
			title={translate('messages.delete.confirm')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey='kiosk.messages.delete_confirm'
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('action.delete')}
			confirmColor='red'
		/>
	);
};
