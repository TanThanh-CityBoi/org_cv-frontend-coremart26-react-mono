export type SettingConfigRow = {
	key: string;
	value: string;
};

export function settingConfigToRows(config?: Record<string, unknown> | null): SettingConfigRow[] {
	if (!config || typeof config !== 'object') return [];
	return Object.entries(config).map(([k, v]) => ({
		key: k,
		value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
	}));
}

export function settingRowsToConfig(rows: SettingConfigRow[]): Record<string, unknown> | null {
	const trimmed = rows.filter((r) => r.key.trim());
	if (trimmed.length === 0) return null;
	const out: Record<string, unknown> = {};
	for (const r of trimmed) {
		out[r.key.trim()] = r.value;
	}
	return out;
}
