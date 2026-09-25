import { Card, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconDeviceDesktop } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { getCurrentConnectionStatus } from '@/common/helpers';
import { CardActionMenu } from '@/components';
import { AddressLink } from '@/components/Address';
import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { KioskConnectionStatus } from '@/components/KioskConnectionStatus';
import { KioskModeStatusBadge } from '@/components/KioskModeStatusBadge';
import { KioskStateMetricsSummary } from '@/components/KioskState';
import { KioskWarning } from '@/components/KioskWarning';
import { TablePagination } from '@/components/Table';
import { type TablePaginationProps } from '@/components/Table';
import { TextLink } from '@/components/Text';

import { ConnectionStatus, Kiosk } from '../../types';
import { getKioskTableActions, type KioskTableActions } from '../KioskTable';



export function getWarningSeverity(kiosk: Kiosk): 'low' | 'medium' | 'high' | 'critical' | null {
	const hasWarnings = kiosk.warnings && kiosk.warnings.length > 0;
	const currentStatus = getCurrentConnectionStatus(kiosk.connection?.history?.[0]);
	const isDisconnected = !kiosk.isArchived && currentStatus === ConnectionStatus.LOST;

	if (!hasWarnings && !isDisconnected) return null;

	if (hasWarnings && kiosk.warnings) {
		const highestSeverity = kiosk.warnings.reduce((highest, warning) => {
			const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
			return severityOrder[warning.severity] > severityOrder[highest.severity] ? warning : highest;
		}, kiosk.warnings[0]);
		return highestSeverity.severity;
	}

	return 'medium';
}

export function getWarningStyle(severity: 'low' | 'medium' | 'high' | 'critical' | null) {
	if (!severity) return null;

	const severityStyles = {
		low: {
			borderColor: 'var(--mantine-color-yellow-3)',
			boxShadow: '0 2px 6px rgba(250, 176, 5, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
		},
		medium: {
			borderColor: 'var(--mantine-color-orange-3)',
			boxShadow: '0 2px 6px rgba(255, 119, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05)',
		},
		high: {
			borderColor: 'var(--mantine-color-red-3)',
			boxShadow: '0 2px 6px rgba(224, 49, 49, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05)',
		},
		critical: {
			borderColor: 'var(--mantine-color-red-4)',
			boxShadow: '0 2px 6px rgba(224, 49, 49, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
		},
	};

	return severityStyles[severity];
}

type KioskGridCardProps = {
	kiosk: Kiosk;
	cardActions: KioskTableActions;
	onClick?: (kiosk: Kiosk) => void;
	translate: TFunction;
};

function KioskGridCard({ kiosk, cardActions, onClick, translate }: KioskGridCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	// const warningSeverity = getWarningSeverity(kiosk);
	// const warningStyle = getWarningStyle(warningSeverity);

	return (
		<Card
			ref={cardRef}
			padding='lg'
			radius='md'
			withBorder
			pos='relative'
			shadow='sm'
			style={{
				cursor: 'pointer',
				// borderColor: warningStyle?.borderColor,
				// borderWidth: '1px',
				// boxShadow: warningStyle?.boxShadow,
			}}
			onClick={() => onClick?.(kiosk)}
		>
			<Stack gap={'xs'}>
				<Group justify='space-between' align='flex-start'>
					<Group gap='xs'>
						<IconDeviceDesktop size={36} stroke={1.5} />
						<Stack gap={3}>
							<TextLink fw={600} size='md' to={`../kiosks/${kiosk.id}`}>{kiosk.name}</TextLink>
							<Text size='xs' c='dimmed'>{kiosk.code}</Text>
						</Stack>
					</Group>
					<Group gap='xs' onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}>
						<CardActionMenu
							items={getKioskTableActions(kiosk, cardActions, translate)}
							contextMenuContainerRef={cardRef}
						/>
					</Group>
				</Group>

				<AddressLink
					address={kiosk.locationAddress as string}
					latitude={String(kiosk.latitude) || undefined}
					longitude={String(kiosk.longitude) || undefined}
				/>
				<Group gap='xs' wrap='nowrap'>
					<ArchivedStatusBadge isArchived={!!kiosk.isArchived} />
					<KioskModeStatusBadge mode={kiosk.mode} />
					<KioskWarning warnings={kiosk.warnings ?? []} />
					<KioskConnectionStatus connections={kiosk.connection?.history ?? []} />
				</Group>

				<Divider label='Thông số' labelPosition='left' />

				<KioskStateMetricsSummary kiosk={kiosk} />

				<Divider />

				<Text size='xs' c='dimmed'>
					{translate('coremart.vendingMachine.kiosk.fields.createdAt')}: {new Date(kiosk.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
}

export interface KioskGridViewProps {
	kiosks: Kiosk[];
	isLoading?: boolean;
	actions?: KioskTableActions;
	pagination?: TablePaginationProps;
}

export const KioskGridView: React.FC<KioskGridViewProps> = ({
	kiosks, isLoading = false, actions = {}, pagination,
}) => {
	const { t: translate } = useTranslation();
	const { preview: _onPreview, ...cardActions } = actions;

	if (isLoading) {
		return <Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>;
	}

	if (kiosks.length === 0) {
		return <Text c='dimmed'>{translate('coremart.vendingMachine.kiosk.messages.no_kiosks')}</Text>;
	}

	return (
		<Stack gap='md' mih={150}>
			<SimpleGrid
				cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
				spacing={{ base: 'sm', sm: 'md', lg: 'lg' }}
			>
				{kiosks.map((kiosk) => (
					<KioskGridCard
						key={kiosk.id}
						kiosk={kiosk}
						cardActions={cardActions ?? {}}
						// onClick={onPreview}
						translate={translate}
					/>
				))}
			</SimpleGrid>
			{pagination ? <TablePagination {...pagination} /> : null}
		</Stack>
	);
};
