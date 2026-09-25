import { Stack, Text, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const OrderNotFound: React.FC = () => {
	const { t: translate } = useTranslation('vending_machine');
	return (
		<Stack gap='sm' p='md' align='center'>
			<Title order={3}>{translate('orders.messages.not_found.title')}</Title>
			<Text c='dimmed'>{translate('orders.messages.not_found.message')}</Text>
		</Stack>
	);
};
