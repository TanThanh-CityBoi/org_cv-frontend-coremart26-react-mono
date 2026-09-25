import { Badge, Box, Modal, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FoldableJsonView } from '@/components/FoldableJsonView';

import type { KioskActivityLogType, KioskLog } from '../../types';


export function formatKioskActivityTimestamp(timestamp: string): string {
	const date = new Date(timestamp);
	return date.toLocaleString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export const KioskActivityTypeBadge: React.FC<{ logType: KioskActivityLogType }> = ({ logType }) => {
	const { t: translate } = useTranslation();
	const typeMap: Record<KioskActivityLogType, { color: string; label: string }> = {
		warning: { color: 'yellow', label: translate('coremart.vendingMachine.kiosk.activity.type.warning') },
		statusDetail: { color: 'blue', label: translate('coremart.vendingMachine.kiosk.activity.type.statusDetail') },
		error: { color: 'red', label: translate('coremart.vendingMachine.kiosk.activity.type.error') },
		inform: { color: 'gray', label: translate('coremart.vendingMachine.kiosk.activity.type.inform') },
	};
	const typeInfo = typeMap[logType] || { color: 'gray', label: logType };
	return <Badge color={typeInfo.color}>{typeInfo.label}</Badge>;
};

export type KioskActivityDetailModalProps = {
	opened: boolean;
	onClose: () => void;
	log: KioskLog | null;
};

export const KioskActivityDetailModal: React.FC<KioskActivityDetailModalProps> = ({
	opened,
	onClose,
	log,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={translate('coremart.vendingMachine.kiosk.activity.detail.title')}
			size='xl'
			centered
		>
			{log && (
				<Stack gap='md'>
					<Box>
						<Text size='sm' c='dimmed' mb={6}>
							{translate('coremart.vendingMachine.kiosk.activity.fields.time')}
						</Text>
						<Text size='sm' fw={500}>{formatKioskActivityTimestamp(log.createdAt)}</Text>
					</Box>
					<Box>
						<Text size='sm' c='dimmed' mb={6}>
							{translate('coremart.vendingMachine.kiosk.activity.fields.type')}
						</Text>
						<KioskActivityTypeBadge logType={log.logType} />
					</Box>
					<Box>
						<Text size='sm' c='dimmed' mb='xs'>
							{translate('coremart.vendingMachine.kiosk.activity.fields.content')}
						</Text>
						<FoldableJsonView data={log.payload ?? null} defaultOpenDepth={2} minHeight={500} />
					</Box>
				</Stack>
			)}
		</Modal>
	);
};
