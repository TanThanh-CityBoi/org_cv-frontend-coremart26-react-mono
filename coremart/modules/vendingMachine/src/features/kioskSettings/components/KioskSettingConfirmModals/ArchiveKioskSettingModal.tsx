import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type KioskSettingArchiveModalType = 'archive' | 'restore';

export type ArchiveKioskSettingModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	type: KioskSettingArchiveModalType,
	name: string,
};

export const ArchiveKioskSettingModal: React.FC<ArchiveKioskSettingModalProps> = ({
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
				? translate('kiosk_settings.messages.archive_modal_title')
				: translate('kiosk_settings.messages.restore_modal_title')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey={isArchive
						? 'kiosk_settings.messages.archive_confirm'
						: 'kiosk_settings.messages.restore_confirm'}
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
