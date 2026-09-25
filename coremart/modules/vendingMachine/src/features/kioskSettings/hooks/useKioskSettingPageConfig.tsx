import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { KioskSettingListViewMode } from '../types';


export type BreadcrumbItem = { title: string, href: string };
export type PageAction = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	label: string,
	leftSection?: React.ReactNode,
	onClick?: () => void,
	variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'default' | 'gradient',
} | null;

export interface UseKioskSettingPageConfigOptions {
	handleRefresh: () => void;
	backendActions?: PageAction[];
	breadcrumbsConfig?: BreadcrumbItem[];
}

export interface UseKioskSettingPageConfigReturn {
	breadcrumbs: BreadcrumbItem[];
	actions: PageAction[];
	viewMode: KioskSettingListViewMode;
	setViewMode: (mode: KioskSettingListViewMode) => void;
}

export const useKioskSettingPageConfig = ({
	handleRefresh,
	backendActions = [],
	breadcrumbsConfig,
}: UseKioskSettingPageConfigOptions): UseKioskSettingPageConfigReturn => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation('vending_machine');
	const [viewMode, setViewMode] = useState<KioskSettingListViewMode>('list');

	const handleCreate = () => {
		navigate('../kiosk-settings/create');
	};

	const breadcrumbs = useMemo(() => {
		if (breadcrumbsConfig) {
			return breadcrumbsConfig;
		}
		return [
			{ title: translate('title'), href: '../overview' },
			{ title: translate('kiosk_settings.title'), href: '#' },
		];
	}, [breadcrumbsConfig, translate]);

	const defaultActions = useMemo(() => [
		{ label: translate('action.create'), leftSection: <IconPlus size={16} />, onClick: handleCreate },
		{ label: translate('action.refresh'), leftSection: <IconRefresh size={16} />, onClick: handleRefresh, variant: 'outline' as const },
	], [handleRefresh, translate]);

	const actions = useMemo(() => {
		const mergedActions = [...defaultActions, ...backendActions];
		return mergedActions.filter((action): action is NonNullable<PageAction> => action !== null);
	}, [defaultActions, backendActions]);

	return {
		breadcrumbs,
		actions,
		viewMode,
		setViewMode,
	};
};
