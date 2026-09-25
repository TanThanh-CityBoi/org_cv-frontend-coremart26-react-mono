import { ConfirmModal } from '@nikkierp/ui/components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type EventArchiveRestoreModalType = 'archive' | 'restore';

export type ArchiveEventModalProps = {
	opened: boolean,
	onClose: () => void,
	onConfirm: () => void,
	type: EventArchiveRestoreModalType,
	name: string,
};

export const ArchiveEventModal: React.FC<ArchiveEventModalProps> = ({
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
				? translate('events.messages.archive_modal_title')
				: translate('events.messages.restore_modal_title')}
			opened={opened}
			onClose={onClose}
			onConfirm={onConfirm}
			message={
				<Trans
					i18nKey={isArchive
						? 'events.messages.archive_confirm'
						: 'events.messages.restore_confirm'}
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
