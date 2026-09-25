import React from 'react';
import { useTranslation } from 'react-i18next';

import { type ControlPanelFilterConfig } from '../../../components';
import { type KioskSetting } from '../types';


export const useKioskSettingFilter = (settings: KioskSetting[]) => {
	const { t: translate } = useTranslation('vending_machine');

	const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
	const [searchValue, setSearchValue] = React.useState('');

	const filteredSettings = React.useMemo(() => {
		let filtered = settings;

		if (statusFilter.length > 0) {
			filtered = filtered.filter((s) =>
				statusFilter.some((f) =>
					(f === 'active' && !s.isArchived) || (f === 'inactive' && !!s.isArchived),
				),
			);
		}

		if (searchValue?.trim()) {
			const q = searchValue.toLowerCase();
			filtered = filtered.filter(
				(s: KioskSetting) =>
					s.code?.toLowerCase().includes(q)
					|| s.name?.toLowerCase().includes(q)
					|| String(s.description ?? '').toLowerCase().includes(q),
			) as KioskSetting[];
		}

		return filtered;
	}, [settings, statusFilter, searchValue]);

	const setActiveFilter = React.useCallback((value: unknown) => {
		setStatusFilter(Array.isArray(value) ? (value as string[]) : []);
	}, []);

	const filters: ControlPanelFilterConfig[] = React.useMemo(() => [
		{
			key: 'active',
			type: 'multiSelect' as const,
			value: statusFilter,
			onChange: setActiveFilter,
			options: [
				{ value: 'active', label: translate('status.active') },
				{ value: 'inactive', label: translate('status.inactive') },
			],
			placeholder: translate('kiosk_settings.filter.status'),
		},
	], [statusFilter, translate, setActiveFilter]);

	return {
		filteredSettings,
		filters,
		searchValue,
		setSearchValue,
	};
};
