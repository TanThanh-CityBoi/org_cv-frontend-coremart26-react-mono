import { MantineSize } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '../StatusBadge';



export const ArchivedStatusBadge: React.FC<{ isArchived: boolean, size?: MantineSize }> = ({ isArchived, size = 'sm' }) => {
	const { t: translate } = useTranslation();

	const statusInfo = isArchived
		? { color: 'orange', label: translate('nikki.general.status.archived') }
		: { color: 'green', label: translate('nikki.general.status.active') };

	return <StatusBadge color={statusInfo.color} size={size}>{statusInfo.label}</StatusBadge>;
};