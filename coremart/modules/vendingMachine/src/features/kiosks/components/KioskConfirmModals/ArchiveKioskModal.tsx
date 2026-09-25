import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type KioskArchiveRestoreModalType = 'archive' | 'restore';

export type ArchiveKioskModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	type: KioskArchiveRestoreModalType,
	name: string,
};

export const ArchiveKioskModal: React.FC<ArchiveKioskModalProps> = ({
	opened,
	onClose,
	onConfirm,
	type,
	name,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	const isArchive = type === 'archive';

	return (
		<ConfirmModal
			title={isArchive
				? translate('kiosk.messages.archive_modal_title')
				: translate('kiosk.messages.restore_modal_title')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey={isArchive
						? 'kiosk.messages.archive_confirm'
						: 'kiosk.messages.restore_confirm'}
					values={{ name }}
					components={{ strong: <strong /> }}
				/>
			}
			confirmLabel={isArchive
				? translate('action.archive')
				: translate('action.restore')}
			confirmColor={isArchive ? 'orange' : 'blue'}
		/>
	);
};
