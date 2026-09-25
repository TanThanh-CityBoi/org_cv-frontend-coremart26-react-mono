import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type ArchiveRestoreModalType = 'archive' | 'restore';

export type ArchiveKioskModelModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	type: ArchiveRestoreModalType,
	name: string,
};

export const ArchiveKioskModelModal: React.FC<ArchiveKioskModelModalProps> = ({
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
				? translate('kiosk_models.messages.archive_modal_title')
				: translate('kiosk_models.messages.restore_modal_title')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey={isArchive
						? 'kiosk_models.messages.archive_confirm'
						: 'kiosk_models.messages.restore_confirm'}
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
