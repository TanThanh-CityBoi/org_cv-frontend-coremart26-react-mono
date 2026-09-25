import { IconDeviceDesktop, IconDeviceDesktopOff } from '@tabler/icons-react';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { GroupedStatCard } from '../../../../../components/GroupedStatCard';
import { KioskStats } from '../../type';


interface KioskCountCardProps {
	data?: KioskStats['archiveStatus'];
}

export function KioskCountCard({ data: archiveStatus }: KioskCountCardProps): React.ReactElement {
	const { t: translate } = useTranslation('vending_machine');

	const activeKiosks = archiveStatus?.find(status => status.value === 'unarchived')?.count ?? 0;
	const archivedKiosks = archiveStatus?.find(status => status.value === 'archived')?.count ?? 0;
	const totalKiosks = activeKiosks + archivedKiosks;

	const items = [
		{
			label: translate('overview.total_kiosks'),
			value: totalKiosks,
			icon: <IconDeviceDesktop size={16} />,
			color: 'blue',
			link: '../kiosks',
		},
		{
			label: translate('overview.active_kiosks'),
			value: activeKiosks,
			icon: <IconDeviceDesktop size={16} />,
			color: 'green',
			link: '../kiosks?isArchived=false',
		},
		{
			label: translate('overview.inactive_kiosks'),
			value: archivedKiosks,
			icon: <IconDeviceDesktopOff size={16} />,
			color: 'red',
			link: '../kiosks?isArchived=true',
		},
	];

	return (
		<GroupedStatCard
			title={translate('overview.kiosk_count')}
			icon={<IconDeviceDesktop size={24} />}
			iconColor='blue'
			link='../kiosks'
			items={items}
		/>
	);
}
