import { VENDING_MACHINE_MODULE } from './constants';

import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';



const ITEMS: MenuItem[] = [
	{ labelKey: 'menu.overview', link: '/overview' },
	{
		labelKey: 'menu.kiosk',
		items: [
			{ labelKey: 'menu.kiosk_management', link: '/kiosks' },
			{ labelKey: 'menu.kiosk_settings', link: '/kiosk-settings' },
			{ labelKey: 'menu.kiosk_models', link: '/kiosk-models' },
			{ labelKey: 'menu.kiosk_devices', link: '/kiosk-devices' },
			{ labelKey: 'menu.settings', link: '/settings' },
		],
	},
	{
		labelKey: 'menu.appearance',
		items: [
			{
				labelKey: 'menu.presentation',
				link: '/media-playlist/playlists',
				items: [
					{ labelKey: 'menu.playlists', link: '/media-playlist/playlists' },
					{ labelKey: 'menu.gallery', link: '/media-playlist/gallery' },
				],
			},
			{ labelKey: 'menu.themes', link: '/themes' },
			{ labelKey: 'menu.mini_game', link: '/games' },
			{ labelKey: 'menu.events', link: '/events' },
		],
	},
	{ labelKey: 'menu.payment', link: '/payment' },
	{
		labelKey: 'menu.reports',
		items: [
			{
				labelKey: 'menu.business_report',
				link: '/reports/business-overview',
				items: [
					{ labelKey: 'menu.business_overview', link: '/reports/business-overview' },
					{ labelKey: 'menu.revenue_report', link: '/reports/revenue' },
					{ labelKey: 'menu.refunds_report', link: '/reports/refund' },
					{ labelKey: 'menu.pnl_report', link: '/reports/pnl' },
					{ labelKey: 'menu.orders_report', link: '/reports/orders' },
				],
			},
			{
				labelKey: 'menu.operations_report',
				link: '/reports/operations-overview',
				items: [
					{
						labelKey: 'menu.operations_overview',
						link: '/reports/operations-overview',
					},
					{ labelKey: 'menu.inventory_report', link: '/reports/inventory' },
				],
			},
		],
	},
];

export function buildVendingMachineMenu(slug: string): MenuContribution {
	return { slug, translationNs: VENDING_MACHINE_MODULE, items: ITEMS };
}
