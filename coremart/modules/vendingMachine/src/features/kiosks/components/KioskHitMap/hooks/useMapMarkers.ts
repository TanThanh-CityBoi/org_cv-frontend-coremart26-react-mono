import { MantineColorScheme } from '@mantine/core';
import { TFunction } from 'i18next';
import maplibregl from 'maplibre-gl';
import { useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getCurrentConnectionStatus } from '../../../../../common/helpers';
import { buildKioskStatePopupHtml } from '../../../../../components/KioskState';
import { Kiosk, ConnectionStatus } from '../../../types';


const clearMarkers = (markersRef: React.RefObject<maplibregl.Marker[]>) => {
	markersRef.current.forEach(marker => marker.remove());
	markersRef.current = [];
};

const getMarkerColor = (isActive: boolean, connectionStatus?: ConnectionStatus): string => {
	// Nếu không hoạt động thì màu xám
	if (!isActive) {
		return '%239ca3af'; // gray-400
	}

	// Nếu đang hoạt động thì màu dựa vào trạng thái kết nối
	switch (connectionStatus) {
		case ConnectionStatus.FAST:
			return '%2351cf66'; // green
		case ConnectionStatus.SLOW:
			return '%23ffd43b'; // yellow
		case ConnectionStatus.LOST:
			return '%23ff6b6b'; // red
		default:
			return '%239ca3af'; // gray-400 (fallback)
	}
};

const createMarkerElement = (isActive: boolean, connectionStatus?: ConnectionStatus): HTMLDivElement => {
	const el = document.createElement('div');
	el.className = 'custom-marker';
	el.style.width = '32px';
	el.style.height = '32px';
	const color = getMarkerColor(isActive, connectionStatus);
	el.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='${color}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E")`;
	el.style.backgroundSize = 'contain';
	el.style.backgroundRepeat = 'no-repeat';
	el.style.backgroundPosition = 'center';
	el.style.cursor = 'pointer';
	return el;
};

const createPopupContent = (kiosk: Kiosk, isOperational: boolean, translate: TFunction): string => {
	const name = kiosk.name || kiosk.code || '';
	const statusText = isOperational
		? translate('status.active')
		: translate('status.archived');

	const connectionHistory = (kiosk?.connection?.history ?? []) || [];
	const currentStatus = getCurrentConnectionStatus(connectionHistory?.[0]);
	const connectionStatusText = getConnectionStatusText(currentStatus, translate);
	const stateInfo = buildKioskStatePopupHtml(kiosk, translate);

	return `
		<div style="padding: 8px;">
			<strong>${name}</strong><br/>
			<span>${translate('kiosk.fields.code')}: ${kiosk.code}</span><br/>
			<span>${translate('kiosk.fields.status')}: ${statusText}</span><br/>
			<span>${translate('kiosk.fields.connection_status')}: ${connectionStatusText}</span><br/>
			<span>${translate('kiosk.fields.address')}: ${kiosk.locationAddress || '—'}</span>
			${stateInfo}
		</div>
	`;
};

const getConnectionStatusText = (connectionStatus: ConnectionStatus | undefined, translate: TFunction): string => {
	switch (connectionStatus) {
		case ConnectionStatus.FAST:
			return translate('kiosk.connection_status.fast');
		case ConnectionStatus.SLOW:
			return translate('kiosk.connection_status.slow');
		case ConnectionStatus.LOST:
			return translate('kiosk.connection_status.disconnected');
		default:
			return '—';
	}
};

const createMarker = (
	map: maplibregl.Map,
	kiosk: Kiosk,
	translate: TFunction,
): maplibregl.Marker => {
	const lat = Number(kiosk.latitude) || 0;
	const lng = Number(kiosk.longitude) || 0;
	const isOperational = !kiosk.isArchived;

	const connectionHistory = (kiosk?.connection?.history ?? []) || [];
	const connectionStatus = getCurrentConnectionStatus(connectionHistory?.[0]);
	const el = createMarkerElement(isOperational, connectionStatus);
	const popupContent = createPopupContent(kiosk, isOperational, translate);

	const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

	const marker = new maplibregl.Marker({
		element: el,
		anchor: 'bottom',
	})
		.setLngLat([lng, lat])
		.setPopup(popup)
		.addTo(map);

	return marker;
};

const createMarkers = (
	map: maplibregl.Map,
	markersRef: React.RefObject<maplibregl.Marker[]>,
	kiosks: Kiosk[],
	translate: TFunction,
) => {
	clearMarkers(markersRef);

	kiosks.forEach((kiosk) => {
		if (!kiosk.latitude || !kiosk.longitude) return;

		const marker = createMarker(map, kiosk, translate);
		markersRef.current.push(marker);
	});
};

interface UseMapMarkersProps {
	mapRef: React.RefObject<maplibregl.Map | null>;
	kiosks?: Kiosk[];
	colorScheme: MantineColorScheme;
}

export function useMapMarkers({ mapRef, kiosks = [], colorScheme }: UseMapMarkersProps) {
	const markersRef = useRef<maplibregl.Marker[]>([]);
	const { t: translate } = useTranslation('vending_machine');

	// Filter kiosks that have valid coordinates
	const kiosksWithCoordinates = useMemo(() => {
		return kiosks.filter(
			(kiosk) => kiosk.latitude && kiosk.longitude,
		);
	}, [kiosks]);

	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		const createMarkersWhenReady = () => {
			// Clear existing markers first
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];

			// Create new markers if there are kiosks with coordinates
			if (kiosksWithCoordinates.length > 0) {
				createMarkers(map, markersRef, kiosksWithCoordinates, translate);
			}
		};

		if (map.loaded()) createMarkersWhenReady();
		else map.once('load', createMarkersWhenReady);

		return () => {
			markersRef.current.forEach(marker => marker.remove());
			markersRef.current = [];
		};
	}, [mapRef, kiosksWithCoordinates, colorScheme, translate]);

	return markersRef;
}

export function createMarkersOnMap(
	map: maplibregl.Map,
	markersRef: React.RefObject<maplibregl.Marker[]>,
	kiosks: Kiosk[],
	translate: TFunction,
) {
	createMarkers(map, markersRef, kiosks, translate);
}
