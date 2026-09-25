import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type DeleteEventModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	name: string;
};

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
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
					i18nKey='coremart.vendingMachine.events.messages.delete_confirm'
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={translate('nikki.general.actions.delete')}
			confirmColor='red'
		/>
	);
};
