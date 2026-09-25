import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type EventArchiveRestoreModalType = 'archive' | 'restore';

export type ArchiveEventModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	type: EventArchiveRestoreModalType;
	name: string;
};

export const ArchiveEventModal: React.FC<ArchiveEventModalProps> = ({
	opened,
	onClose,
	onConfirm,
	type,
	name,
}) => {
	const { t: translate } = useTranslation();

	const isArchive = type === 'archive';

	return (
		<ConfirmModal
			title={isArchive
				? translate('coremart.vendingMachine.events.messages.archive_modal_title')
				: translate('coremart.vendingMachine.events.messages.restore_modal_title')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey={isArchive
						? 'coremart.vendingMachine.events.messages.archive_confirm'
						: 'coremart.vendingMachine.events.messages.restore_confirm'}
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={isArchive
				? translate('nikki.general.actions.archive')
				: translate('nikki.general.actions.restore')}
			confirmColor={isArchive ? 'orange' : 'blue'}
		/>
	);
};
