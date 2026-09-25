import { Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconWifi, IconWifiOff } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatRelativeTime, getCurrentConnectionStatus } from '@/common/helpers';
import { ConnectionHistory, ConnectionStatus } from '@/features/kiosks';


export type KioskConnectionStatusTranslate = (key: string, options?: { count?: number }) => string;

export type KioskConnectionStatusProps = {
	connections?: ConnectionHistory[] | null;
};


export const KioskConnectionStatus: React.FC<KioskConnectionStatusProps> = ({ connections }) => {
	const { t: translate } = useTranslation();
	const connectionHistory = connections ?? [];
	const lastConnection = connectionHistory[0];
	const currentStatus = getCurrentConnectionStatus(lastConnection);

	const statusMap = {
		[ConnectionStatus.FAST]: {
			label: translate('coremart.vendingMachine.kiosk.connectionStatus.fast'),
			icon: <IconWifi size={20} color='#51cf66' />,
		},
		[ConnectionStatus.SLOW]: {
			label: translate('coremart.vendingMachine.kiosk.connectionStatus.slow'),
			icon: <IconWifi size={20} color='#ffd43b' />,
		},
		[ConnectionStatus.LOST]: {
			label: translate('coremart.vendingMachine.kiosk.connectionStatus.disconnected'),
			icon: <IconWifiOff size={20} color='#ff6b6b' />,
		},
	};

	const currentConnecttion = statusMap[currentStatus] || statusMap[ConnectionStatus.LOST];

	const tooltipContent = connectionHistory.length > 0 ? (
		<Stack gap='xs' style={{ maxWidth: 300 }}>
			<Text size='sm' fw={500}>
				{translate('coremart.vendingMachine.kiosk.connectionHistory.title')}
			</Text>
			{connectionHistory.slice(0, 5).map((history, index) => {
				const historyStatus = statusMap[history.status];
				if (!historyStatus) return null;
				return (
					<Group key={index} gap='xs' align='center'>
						{historyStatus.icon}
						<Text size='xs'>{historyStatus.label}</Text>
						<Text size='xs' c='dimmed' ml='auto'>
							{formatRelativeTime(history.createdAt ?? '', translate)}
						</Text>
					</Group>
				);
			})}
		</Stack>
	) : (
		<Text size='sm'>{translate('coremart.vendingMachine.kiosk.connectionHistory.no_history')}</Text>
	);

	return (
		<Tooltip label={tooltipContent} withArrow position='right-start' multiline>
			<Box style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
				{currentConnecttion.icon}
			</Box>
		</Tooltip>
	);
};
