/**
 * Shared report chart palette (fills + borders).
 * Replaces legacy ad-hoc donut arrays and bar primary colors.
 */

export const REPORT_PALETTE_FILLS = {
	blue: 'rgba(59, 130, 246, 0.8)',
	gold: 'rgba(234, 179, 8, 0.8)',
	emerald: 'rgba(34, 197, 94, 0.8)',
	tangerine: 'rgba(251, 146, 60, 0.8)',
	pearl: 'rgba(245, 245, 245, 0.9)',
	gray: 'rgba(156, 163, 175, 0.8)',
	violet: 'rgba(168, 85, 247, 0.8)',
	teal: 'rgba(13, 148, 136, 0.82)',
	rose: 'rgba(244, 63, 94, 0.82)',
	slate: 'rgba(100, 116, 139, 0.8)',
	indigo: 'rgba(99, 102, 241, 0.85)',
	crimson: 'rgba(220, 38, 36, 0.75)',
	red: 'rgba(240, 20, 20, 0.75)',
	coffee: 'rgba(139, 69, 19, 0.8)',
} as const;

/** Border colors paired with {@link REPORT_PALETTE_FILLS} keys. */
export const REPORT_PALETTE_BORDERS = {
	blue: 'rgba(59, 130, 246, 1)',
	gold: 'rgba(234, 179, 8, 1)',
	emerald: 'rgba(34, 197, 94, 1)',
	tangerine: 'rgba(251, 146, 60, 1)',
	pearl: 'rgba(245, 245, 245, 1)',
	gray: 'rgba(156, 163, 175, 1)',
	violet: 'rgba(168, 85, 247, 1)',
	teal: 'rgba(13, 148, 136, 1)',
	rose: 'rgba(244, 63, 94, 1)',
	slate: 'rgba(100, 116, 139, 1)',
	indigo: 'rgba(99, 102, 241, 1)',
	crimson: 'rgba(220, 38, 36, 1)',
	red: 'rgba(240, 20, 20, 1)',
	coffee: 'rgba(139, 69, 19, 1)',
} as const;

export type ReportPaletteKey = keyof typeof REPORT_PALETTE_FILLS;

/** Order when cycling colors by category key (donuts, multi-series). */
export const REPORT_PALETTE_SEQUENCE = Object.keys(REPORT_PALETTE_FILLS) as ReportPaletteKey[];

export function reportPaletteKeyAt(colorIndex: number): ReportPaletteKey {
	return REPORT_PALETTE_SEQUENCE[colorIndex % REPORT_PALETTE_SEQUENCE.length]!;
}
