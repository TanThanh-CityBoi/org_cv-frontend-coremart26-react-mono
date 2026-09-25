import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';


export type RemoveKioskFromEventModalProps = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	kioskName: string;
	eventName: string;
	confirmLoading?: boolean;
};

export const RemoveKioskFromEventModal: React.FC<RemoveKioskFromEventModalProps> = ({
	opened,
	onClose,
	onConfirm,
	kioskName,
	eventName,
	confirmLoading = false,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Modal
			opened={opened}
			onClose={() => {
				if (!confirmLoading) onClose();
			}}
			title={(
				<Text fw={700} fz='lg'>
					{translate('coremart.vendingMachine.events.messages.remove_kiosk_from_event_title', {
						defaultValue: 'Remove kiosk from event',
					})}
				</Text>
			)}
			size='md'
			centered
			closeOnClickOutside={!confirmLoading}
			closeOnEscape={!confirmLoading}
		>
			<Stack gap='md'>
				<Text>
					<Trans
						i18nKey='coremart.vendingMachine.events.messages.remove_kiosk_from_event_confirm'
						values={{ kioskName, eventName }}
						components={{ strong: <strong /> }}
					/>
				</Text>
				<Group justify='flex-end'>
					<Button variant='outline' onClick={onClose} color='gray' disabled={confirmLoading}>
						{translate('nikki.general.actions.cancel')}
					</Button>
					<Button color='red' onClick={onConfirm} loading={confirmLoading}>
						{translate('nikki.general.actions.remove')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
