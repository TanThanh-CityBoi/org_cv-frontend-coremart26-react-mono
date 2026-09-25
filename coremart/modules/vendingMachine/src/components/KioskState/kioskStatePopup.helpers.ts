import {
	formatKioskStateNumber,
	getKioskState,
	parseKioskSwitchValue,
} from './kioskState.helpers';
import { formatDateTime, getDate } from '../../common/helpers';


import type { Kiosk } from '../../features/kiosks/types';
import type { TFunction } from 'i18next';




function formatSwitchLabel(value: string | undefined | null, translate: TFunction): string {
	const parsed = parseKioskSwitchValue(value);
	if (parsed == null) return translate('kiosk.state_switch.unknown');
	return parsed
		? translate('kiosk.state_switch.on')
		: translate('kiosk.state_switch.off');
}

export function buildKioskStatePopupHtml(kiosk: Kiosk, translate: TFunction): string {
	const state = getKioskState(kiosk);
	if (!state) return '';

	const lines: string[] = [];
	const temperature = formatKioskStateNumber(state.temperature, { unit: '°C', decimals: 1 });
	const humidity = formatKioskStateNumber(state.humidity, { unit: '%', decimals: 1 });
	const current = formatKioskStateNumber(state.current, { unit: ' A', decimals: 3 });
	const energy = formatKioskStateNumber(state.energy, { unit: ' kWh', decimals: 3 });
	const power = formatKioskStateNumber(state.power, { unit: ' W', decimals: 1 });

	const reportTime = getDate(state.bucketTime) ? formatDateTime(state.bucketTime) : '_';

	if (temperature) {
		lines.push(`<span>${translate('kiosk.state.temperature')}: ${temperature}</span>`);
	}
	if (humidity) {
		lines.push(`<span>${translate('kiosk.state.humidity')}: ${humidity}</span>`);
	}
	if (current) {
		lines.push(`<span>${translate('kiosk.state.current')}: ${current}</span>`);
	}
	if (energy) {
		lines.push(`<span>${translate('kiosk.state.energy')}: ${energy}</span>`);
	}
	if (power) {
		lines.push(`<span>${translate('kiosk.state.power')}: ${power}</span>`);
	}
	lines.push(
		`<span>${translate('kiosk.state.output_door_switch')}: ${formatSwitchLabel(state.outputDoorSwitch, translate)}</span>`,
	);
	lines.push(
		`<span>${translate('kiosk.state.output_switch')}: ${formatSwitchLabel(state.outputSwitch, translate)}</span>`,
	);

	lines.push(`<span>${translate('kiosk.state.updated_at')}: ${reportTime}</span>`);

	if (lines.length === 0) return '';

	return `
		<br/><br/>
		<strong>${translate('kiosk.state.section_title')}:</strong><br/>
		${lines.join('<br/>')}
	`;
};
