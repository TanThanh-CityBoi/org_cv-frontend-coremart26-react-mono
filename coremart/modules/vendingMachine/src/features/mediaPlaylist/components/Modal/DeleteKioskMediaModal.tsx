import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type DeleteKioskMediaModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	name: string,
};

export const DeleteKioskMediaModal: React.FC<DeleteKioskMediaModalProps> = ({
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
					i18nKey='kiosk_media.messages.delete_confirm'
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('action.delete')}
			confirmColor='red'
		/>
	);
};
