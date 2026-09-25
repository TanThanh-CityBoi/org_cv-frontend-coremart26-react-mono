/* eslint-disable max-lines-per-function */
import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconBottle, IconCurrencyDollar, IconDeviceDesktopDollar, IconFileAlert, IconShoppingCart, IconUsers } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';


interface WelcomeCardProps {
	date: string;
	greeting: string;
	visitors: number;
	earnings: string;
	orders: number;
	averageRevenue: string;
	averageRevenuePerOrder: string;
	totalItemCount: number;
	totalSuccessItemCount: number;
	totalRefund: string;
	refundedOrderCount: number;
}

const WELCOME_CARD_I18N = 'reports.business.welcome_card';

export function WelcomeCard({
	date,
	greeting,
	visitors,
	earnings,
	orders,
	averageRevenue,
	averageRevenuePerOrder,
	totalItemCount,
	totalSuccessItemCount,
	totalRefund,
	refundedOrderCount,
}: WelcomeCardProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const errorRate = useMemo(() => {
		if (totalItemCount <= 0) return '0.00';
		const rate = ((totalItemCount - totalSuccessItemCount) / totalItemCount) * 100;
		return rate.toFixed(2);
	}, [totalSuccessItemCount, totalItemCount]);

	const refundRate = useMemo(() => {
		if (orders <= 0) return '0.00';
		const rate = (refundedOrderCount / orders) * 100;
		return rate.toFixed(2);
	}, [refundedOrderCount, orders]);

	const erroredItemCount = totalItemCount - totalSuccessItemCount;

	return (
		<Card shadow='sm' padding='md' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={4}>
						<Text size='sm' c='dimmed'>
							{date}
						</Text>
						<Title order={3} fw={600}>
							{greeting}
						</Title>
					</Stack>
				</Group>

				<Stack gap='xs'>
					<Text size='sm' fw={500}>
						{translate(`${WELCOME_CARD_I18N}.updatesFromToday`)}
					</Text>
					<Group gap='lg'>
						<Group gap='xs' align='center'>
							<IconCurrencyDollar size={22} />
							<Text size='xl' c='yellow' fw={600}>{earnings}</Text>
							<Text size='sm'>{translate(`${WELCOME_CARD_I18N}.earnings`)}</Text>
						</Group>
						<Group gap='xs' align='center'>
							<IconShoppingCart size={20} />
							<Text size='xl' c='dimmed' fw={600}>{orders.toLocaleString()}</Text>
							<Text size='sm'>{translate(`${WELCOME_CARD_I18N}.orders`)}</Text>
						</Group>
						<Group gap='xs' align='center'>
							<IconUsers size={20} />
							<Text size='lg' c='dimmed' fw={600}>{visitors.toLocaleString()}</Text>
							<Text size='sm'>{translate(`${WELCOME_CARD_I18N}.visitors`)}</Text>
						</Group>
					</Group>
				</Stack>

				<Stack gap='xs'>
					<Card padding='xs' withBorder radius='sm'>
						<Group justify='space-between' align='center'>
							<IconDeviceDesktopDollar size={26} stroke={1.5} />
							<Stack gap={3} flex={1}>
								<Group gap={0} justify='space-between'>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.averageRevenue`)}
									</Text>
									<Text size='sm' c='yellow' fw={600}>
										{averageRevenue}
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.averageRevenuePerOrder`)}
									</Text>
									<Text size='sm' c='yellow' fw={600}>
										{averageRevenuePerOrder}
									</Text>
								</Group>
							</Stack>
						</Group>
					</Card>

					<Card padding='xs' withBorder radius='sm'>
						<Group justify='space-between' align='center'>
							<IconBottle size={30} stroke={1.5} />
							<Stack gap={3} flex={1}>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.itemsSold`)}
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										{translate(`${WELCOME_CARD_I18N}.itemsCount`, { count: totalItemCount })}
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.itemsErrored`)}
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										{translate(`${WELCOME_CARD_I18N}.itemsCount`, { count: erroredItemCount })}
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.errorRate`)}
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										{errorRate} %
									</Text>
								</Group>
							</Stack>
						</Group>
					</Card>

					<Card padding='xs' withBorder radius='sm'>
						<Group justify='space-between' align='center'>
							<IconFileAlert size={28} stroke={1.5} />
							<Stack gap={3} flex={1}>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.refundedAmount`)}
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										{totalRefund}
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.refundedOrders`)}
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										{translate(`${WELCOME_CARD_I18N}.ordersCount`, { count: refundedOrderCount })}
									</Text>
								</Group>
								<Group gap={0} justify='space-between' flex={1}>
									<Text size='sm' fw={500}>
										{translate(`${WELCOME_CARD_I18N}.refundRate`)}
									</Text>
									<Text size='sm' c='dimmed' fw={600}>
										{refundRate} %
									</Text>
								</Group>
							</Stack>
						</Group>
					</Card>
				</Stack>
				<Button variant='light' size='xs' fullWidth component={Link} to='../reports/revenue'>
					{translate(`${WELCOME_CARD_I18N}.viewAllReports`)}
				</Button>
			</Stack>
		</Card>
	);
}
