import { Center, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const EventNotFound: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');

	return (
		<Center h='100%' w='100%' p='xl' bg='gray.0'>
			<Stack align='center' gap='md'>
				<IconAlertCircle size={48} color='red' />
				<Title order={4}>{translate('events.messages.not_found_title')}</Title>
				<Text c='dimmed'>{translate('events.messages.not_found_message')}</Text>
			</Stack>
		</Center>
	);
};
