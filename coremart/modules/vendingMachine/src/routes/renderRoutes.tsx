import { AppRoute, WidgetRoute } from '@nikkierp/ui/microApp';
import React from 'react';
import { Outlet } from 'react-router';

import type { AppRouteConfig } from './appRoutes';
import type { WidgetRouteConfig } from './widgetRoutes';


export function renderAppRoutes(routes: AppRouteConfig[]): React.ReactNode {
	return routes.map((route) => {
		const { key, path, element, index, children } = route;

		return ( index ?
			<AppRoute key={key} index element={element} /> :
			<AppRoute key={key} path={path ?? ''} element={element ?? <Outlet />}>
				{children && renderAppRoutes(children)}
			</AppRoute>
		);
	});
}


export function renderWidgetRoutes(routes: WidgetRouteConfig[]): React.ReactNode {
	return routes.map((route) => {
		const { key, element } = route;
		return (
			<WidgetRoute key={key} name={key} Component={element ?? (() => <></>)} />
		);
	});
}
