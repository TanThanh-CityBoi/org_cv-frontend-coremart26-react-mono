import { Card, Text } from '@mantine/core';


type SummaryMetricCardProps = {
	label: string;
	value: string;
};

export function SummaryMetricCard({ label, value }: SummaryMetricCardProps): React.ReactElement {
	return (
		<Card withBorder padding='md' radius='md' shadow='sm'>
			<Text size='sm' c='dimmed' tt='uppercase' fw={600}>{label}</Text>
			<Text fw={700} fz='xl'>{value}</Text>
		</Card>
	);
}