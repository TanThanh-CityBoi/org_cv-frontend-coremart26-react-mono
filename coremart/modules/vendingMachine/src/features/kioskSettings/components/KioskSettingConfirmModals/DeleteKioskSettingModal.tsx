import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type DeleteKioskSettingModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	name: string;
};

export const DeleteKioskSettingModal: React.FC<DeleteKioskSettingModalProps> = ({
	opened,
	onClose,
	onConfirm,
	name,
}) => {
	const { t: translate } = useTranslation();

	return (
		<ConfirmModal
			title={translate('nikki.general.messages.delete_confirm')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey='coremart.vendingMachine.kioskSettings.messages.delete_confirm'
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('nikki.general.actions.delete')}
			confirmColor='red'
		/>
	);
};
