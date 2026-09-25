import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export type EditKioskMediaNameModalProps = {
	opened: boolean,
	onClose: () => void,
	name: string,
	onNameChange: (value: string) => void,
	onSubmit: () => void,
	isSubmitting: boolean,
};

export const EditKioskMediaNameModal: React.FC<EditKioskMediaNameModalProps> = ({
	opened,
	onClose,
	name,
	onNameChange,
	onSubmit,
	isSubmitting,
}) => {
	const { t: translate } = useTranslation('vending_machine');

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={translate('kiosk_media.edit.title')}
			centered
			size='md'
		>
			<Stack gap='md'>
				<TextInput
					value={name}
					onChange={(e) => onNameChange(e.currentTarget.value)}
					disabled={isSubmitting}
					autoFocus
					size='md'
					py='sm'
				/>
				<Group justify='flex-end' gap='sm'>
					<Button variant='default' onClick={onClose} disabled={isSubmitting}>
						{translate('action.cancel')}
					</Button>
					<Button onClick={onSubmit} loading={isSubmitting}>
						{translate('action.save')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};
