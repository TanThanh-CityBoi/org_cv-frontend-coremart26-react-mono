import { Box, Divider, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';


export const AuditDate: React.FC<{ date: string, label?: string }> = ({ date, label }) => {
	const { t: translate } = useTranslation('vending_machine');
	return (
		<>
			<Divider my={3} />
			<Box>
				<Text size='sm' c='dimmed' mb={3}>
					{ label || translate('common.fields.created_at')}
				</Text>
				<Text size='sm'>{date ? new Date(date).toLocaleString() : '—'}</Text>
			</Box>
		</>
	);
};