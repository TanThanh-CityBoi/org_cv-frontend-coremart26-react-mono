/**
 * Seeding a stock line's sell price from the catalogue price.
 *
 * Shared by the kiosk and event create-stock modals, which held identical copies of this before.
 */

/**
 * The initial `sellPrice` for a newly selected product.
 *
 * Returns `''` — an empty input the operator must fill in — when the product has no catalogue
 * price, rather than `0`. The distinction matters: this value is saved as-is if left untouched,
 * so defaulting to zero silently stocks an unpriced product to be given away. An operator faced
 * with an empty required field types the price; one shown `0` has no reason to notice.
 *
 * See BR §6.12: a product without an applicable price rule has no price, which is not zero.
 */
export function sellPriceFromProposedPrice(proposed: string | undefined): number | string {
	if (proposed == null || proposed === '') {
		return '';
	}
	const parsed = Number(String(proposed).replace(/\s/g, ''));
	if (!Number.isFinite(parsed) || parsed < 0) {
		return '';
	}
	return Math.floor(parsed);
}

/**
 * Renders a catalogue price for display, showing an em dash when the product has no price rule.
 *
 * `formatCurrency.VND(Number(undefined))` would render `0 ₫`, telling the operator the product is
 * free when in truth it is simply unpriced.
 */
export function formatCatalogPrice(
	proposed: string | undefined, format: (value: number) => string,
): string {
	if (proposed == null || proposed === '') {
		return '—';
	}
	const parsed = Number(String(proposed).replace(/\s/g, ''));
	if (!Number.isFinite(parsed)) {
		return '—';
	}
	return format(parsed);
}
