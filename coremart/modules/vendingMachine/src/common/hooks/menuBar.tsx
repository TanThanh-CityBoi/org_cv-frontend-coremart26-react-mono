/* eslint-disable max-lines-per-function */

import { MenuBarItem } from '@nikkierp/ui/appState';
import { useTranslation } from 'react-i18next';


export function useMenuBarItems(): MenuBarItem[] {
	const { t: translate } = useTranslation();
	return [
		{
			label: translate('coremart.vendingMachine.menu.overview'),
			link: '/overview',
		},
		{
			label: translate('coremart.vendingMachine.menu.kiosk'),
			items: [
				{
					label: translate('coremart.vendingMachine.menu.kiosk_management'),
					link: '/kiosks',
				},
				{
					label: translate('coremart.vendingMachine.menu.kiosk_settings'),
					link: '/kiosk-settings',
				},
				{
					label: translate('coremart.vendingMachine.menu.kiosk_models'),
					link: '/kiosk-models',
				},
				// {
				// 	label: translate('coremart.vendingMachine.menu.kiosk_devices'),
				// 	link: '/kiosk-devices',
				// },
				{
					label: translate('coremart.vendingMachine.menu.settings'),
					link: '/settings',
				},
			],
		},
		{
			label: translate('coremart.vendingMachine.menu.appearance'),
			items: [
				{
					label: translate('coremart.vendingMachine.menu.presentation'),
					link: '/media-playlist/playlists',
					items: [
						{
							label: translate('coremart.vendingMachine.menu.playlists'),
							link: '/media-playlist/playlists',
						},
						{
							label: translate('coremart.vendingMachine.menu.gallery'),
							link: '/media-playlist/gallery',
						},
					],
				},
				{
					label: translate('coremart.vendingMachine.menu.themes'),
					link: '/themes',
				},
				{
					label: translate('coremart.vendingMachine.menu.miniGame'),
					link: '/games',
				},
				{
					label: translate('coremart.vendingMachine.menu.events'),
					link: '/events',
				},
			],
		},
		{
			label: translate('coremart.vendingMachine.menu.payment'),
			link: '/payment',
		},
		{
			label: translate('coremart.vendingMachine.menu.reports'),
			items: [
				{
					label: translate('coremart.vendingMachine.menu.business_report'),
					link: '/reports/business-overview',
					items: [
						{
							label: translate('coremart.vendingMachine.menu.business_overview'),
							link: '/reports/business-overview',
						},
						{
							label: translate('coremart.vendingMachine.menu.revenue_report'),
							link: '/reports/revenue',
						},
						{
							label: translate('coremart.vendingMachine.menu.refunds_report'),
							link: '/reports/refund',
						},
						{
							label: translate('coremart.vendingMachine.menu.pnl_report'),
							link: '/reports/pnl',
						},
						{
							label: translate('coremart.vendingMachine.menu.orders_report'),
							link: '/reports/orders',
						},
					],
				},
				{
					label: translate('coremart.vendingMachine.menu.operations_report'),
					link: '/reports/operations-overview',
					items: [
						{
							label: translate('coremart.vendingMachine.menu.operations_overview'),
							link: '/reports/operations-overview',
						},
						{
							label: translate('coremart.vendingMachine.menu.inventory_report'),
							link: '/reports/inventory',
						},
					],
				},
			],
		},
	];
}