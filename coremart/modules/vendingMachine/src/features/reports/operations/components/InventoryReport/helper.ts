import type { InventoryReportAppliedFilters, InventorySourceRow } from './type';

export function filterInventoryRows(
	rows: readonly InventorySourceRow[],
	applied: InventoryReportAppliedFilters,
): InventorySourceRow[] {
	const label = applied.kioskLabel?.trim().toLowerCase();
	if (!label) {
		return [...rows];
	}
	return rows.filter((r) => r.kioskName.toLowerCase().includes(label));
}

export function aggregateInventoryQtyByCategory(
	rows: readonly InventorySourceRow[],
): { key: string; qty: number }[] {
	const map = new Map<string, number>();
	for (const r of rows) {
		map.set(r.categoryKey, (map.get(r.categoryKey) ?? 0) + r.totalQty);
	}
	return [...map.entries()]
		.map(([key, qty]) => ({ key, qty }))
		.sort((a, b) => b.qty - a.qty);
}
