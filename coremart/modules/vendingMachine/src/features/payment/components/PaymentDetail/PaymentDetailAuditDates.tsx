import { Box, Divider, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PaymentMethod } from '../../types';


export interface PaymentDetailAuditDatesProps {
	payment: PaymentMethod;
}

export const PaymentDetailAuditDates: React.FC<PaymentDetailAuditDatesProps> = ({ payment }) => {
	const { t: translate } = useTranslation('vending_machine');

	return (
		<>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{translate('payment.fields.created_at')}
				</Text>
				<Text size='sm'>{new Date(payment.createdAt).toLocaleString()}</Text>
			</Box>
		</>
	);
};
