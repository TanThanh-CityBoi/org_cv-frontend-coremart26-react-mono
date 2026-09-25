import type { Kiosk, KioskState } from '@/features/kiosks/types';


export function getKioskState(kiosk?: Kiosk | null): KioskState | null | undefined {
	return kiosk?.kioskState;
}

export function parseKioskStateNumber(value: string | undefined | null): number | null {
	if (value == null || value === '') return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

export function formatKioskStateNumber(
	value: string | undefined | null,
	options?: { unit?: string; decimals?: number },
): string | null {
	const parsed = parseKioskStateNumber(value);
	if (parsed == null) return null;
	const decimals = options?.decimals ?? 2;
	const formatted = parsed.toFixed(decimals).replace(/\.?0+$/, '');
	return options?.unit ? `${formatted}${options.unit}` : formatted;
}

export function parseKioskSwitchValue(value: string | undefined | null): boolean | null {
	if (value == null || value === '') return null;
	const normalized = value.trim().toLowerCase();
	if (normalized === '01' || normalized === '1' || normalized === 'on' || normalized === 'true') return true;
	if (normalized === '00' || normalized === '0' || normalized === 'off' || normalized === 'false') return false;
	return null;
}
