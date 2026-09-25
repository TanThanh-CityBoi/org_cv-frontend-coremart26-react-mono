import { formatDateTime, getDate } from '@/common/helpers';

import {
	formatKioskStateNumber,
	getKioskState,
	parseKioskSwitchValue,
} from './kioskState.helpers';

import type { Kiosk } from '@/features/kiosks/types';
import type { TFunction } from 'i18next';




function formatSwitchLabel(value: string | undefined | null, translate: TFunction): string {
	const parsed = parseKioskSwitchValue(value);
	if (parsed == null) return translate('coremart.vendingMachine.kiosk.stateSwitch.unknown');
	return parsed
		? translate('coremart.vendingMachine.kiosk.stateSwitch.on')
		: translate('coremart.vendingMachine.kiosk.stateSwitch.off');
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
		lines.push(`<span>${translate('coremart.vendingMachine.kiosk.state.temperature')}: ${temperature}</span>`);
	}
	if (humidity) {
		lines.push(`<span>${translate('coremart.vendingMachine.kiosk.state.humidity')}: ${humidity}</span>`);
	}
	if (current) {
		lines.push(`<span>${translate('coremart.vendingMachine.kiosk.state.current')}: ${current}</span>`);
	}
	if (energy) {
		lines.push(`<span>${translate('coremart.vendingMachine.kiosk.state.energy')}: ${energy}</span>`);
	}
	if (power) {
		lines.push(`<span>${translate('coremart.vendingMachine.kiosk.state.power')}: ${power}</span>`);
	}
	lines.push(
		`<span>${translate('coremart.vendingMachine.kiosk.state.outputDoorSwitch')}: ${formatSwitchLabel(state.outputDoorSwitch, translate)}</span>`,
	);
	lines.push(
		`<span>${translate('coremart.vendingMachine.kiosk.state.outputSwitch')}: ${formatSwitchLabel(state.outputSwitch, translate)}</span>`,
	);

	lines.push(`<span>${translate('coremart.vendingMachine.kiosk.state.updatedAt')}: ${reportTime}</span>`);

	if (lines.length === 0) return '';

	return `
		<br/><br/>
		<strong>${translate('coremart.vendingMachine.kiosk.state.sectionTitle')}:</strong><br/>
		${lines.join('<br/>')}
	`;
};
