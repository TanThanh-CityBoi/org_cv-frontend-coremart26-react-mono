import { Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconWifi, IconWifiOff } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatRelativeTime, getCurrentConnectionStatus } from '../../common/helpers';
import { ConnectionHistory, ConnectionStatus } from '../../features/kiosks';


export type KioskConnectionStatusTranslate = (key: string, options?: { count?: number }) => string;

export type KioskConnectionStatusProps = {
	connections?: ConnectionHistory[] | null,
};


export const KioskConnectionStatus: React.FC<KioskConnectionStatusProps> = ({ connections }) => {
	const { t: translate } = useTranslation('vending_machine');
	const connectionHistory = connections ?? [];
	const lastConnection = connectionHistory[0];
	const currentStatus = getCurrentConnectionStatus(lastConnection);

	const statusMap = {
		[ConnectionStatus.FAST]: {
			label: translate('kiosk.connection_status.fast'),
			icon: <IconWifi size={20} color='#51cf66' />,
		},
		[ConnectionStatus.SLOW]: {
			label: translate('kiosk.connection_status.slow'),
			icon: <IconWifi size={20} color='#ffd43b' />,
		},
		[ConnectionStatus.LOST]: {
			label: translate('kiosk.connection_status.disconnected'),
			icon: <IconWifiOff size={20} color='#ff6b6b' />,
		},
	};

	const currentConnecttion = statusMap[currentStatus] || statusMap[ConnectionStatus.LOST];

	const tooltipContent = connectionHistory.length > 0 ? (
		<Stack gap='xs' style={{ maxWidth: 300 }}>
			<Text size='sm' fw={500}>
				{translate('kiosk.connection_history.title')}
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
		<Text size='sm'>{translate('kiosk.connection_history.no_history')}</Text>
	);

	return (
		<Tooltip label={tooltipContent} withArrow position='right-start' multiline>
			<Box style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
				{currentConnecttion.icon}
			</Box>
		</Tooltip>
	);
};
