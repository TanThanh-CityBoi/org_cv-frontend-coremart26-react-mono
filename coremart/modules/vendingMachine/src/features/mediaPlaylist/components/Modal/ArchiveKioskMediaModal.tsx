import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type ArchiveRestoreKioskMediaModalType = 'archive' | 'restore';

export type ArchiveKioskMediaModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	type: ArchiveRestoreKioskMediaModalType;
	name: string;
};

export const ArchiveKioskMediaModal: React.FC<ArchiveKioskMediaModalProps> = ({
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
				? translate('coremart.vendingMachine.kioskMedia.messages.archive_modal_title')
				: translate('coremart.vendingMachine.kioskMedia.messages.restore_modal_title')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey={isArchive
						? 'coremart.vendingMachine.kioskMedia.messages.archive_confirm'
						: 'coremart.vendingMachine.kioskMedia.messages.restore_confirm'}
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
