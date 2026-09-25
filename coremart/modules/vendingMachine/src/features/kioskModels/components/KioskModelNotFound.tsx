import { Center, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface KioskModelNotFoundProps {
	showBackButton?: boolean;
}

export const KioskModelNotFound: React.FC<KioskModelNotFoundProps> = () => {
	const { t: translate } = useTranslation('vending_machine');

	return (
		<Center
			h='100%'
			w='100%'
			p='xl'
			bg='gray.0'
		>
			<Stack align='center' gap='md'>
				<IconAlertCircle size={48} color='red' />
				<Title order={4}>{translate('kiosk_models.messages.not_found.title')}</Title>
				<Text c='dimmed'>{translate('kiosk_models.messages.not_found.message')}</Text>
			</Stack>
		</Center>
	);
};
