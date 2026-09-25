import { describe, expect, it } from 'vitest';

import { mapVariantRowToKioskProduct } from './kioskProductMapper';
import { formatCatalogPrice, sellPriceFromProposedPrice } from './sellPrice';


/**
 * These pin the defect that motivated BR §6.12's implementation.
 *
 * After the template/variant split the catalogue stopped carrying `proposed_price`, and the
 * mapper defaulted the missing value to `'0'`. The create-stock modals seed each line's
 * `sellPrice` from it, so every product was being stocked at 0 ₫ — no error, no warning, and
 * saveable without the operator touching the field.
 *
 * The rule throughout is that a missing price stays missing. Nothing here may turn it into zero.
 */

describe('mapVariantRowToKioskProduct', () => {
	it('leaves the price undefined when the product has no price rule', () => {
		const product = mapVariantRowToKioskProduct({ id: '01VARIANT', sku: 'TSH-BLK-M' });

		expect(product.proposedPrice).toBeUndefined();
		// The specific value that caused the bug. Asserted by itself because '0' is falsy-adjacent
		// and would otherwise slip past a loose "no price" check.
		expect(product.proposedPrice).not.toBe('0');
	});

	it('carries a real price through unchanged', () => {
		const product = mapVariantRowToKioskProduct({ id: '01VARIANT', price: 15000 });

		expect(product.proposedPrice).toBe('15000');
	});

	it('treats an explicit null price as no price', () => {
		const product = mapVariantRowToKioskProduct({ id: '01VARIANT', price: null });

		expect(product.proposedPrice).toBeUndefined();
	});

	it('keeps a genuine zero price distinguishable from no price', () => {
		const product = mapVariantRowToKioskProduct({ id: '01VARIANT', price: 0 });

		// A product deliberately priced at zero is a real, if unusual, case; it must not be
		// confused with an unpriced one.
		expect(product.proposedPrice).toBe('0');
	});

	/**
	 * The route returns effective products, so the display name is composed server-side from the
	 * template name plus the variant's attribute values. See BR §5.5 and AC-PROD-013.
	 */
	it('prefers the resolved display name over the template name', () => {
		const product = mapVariantRowToKioskProduct({
			id: '01VARIANT',
			displayName: 'Classic T-Shirt / Black / M',
			templateName: { 'en-US': 'Classic T-Shirt' },
		});

		expect(product.name['en-US']).toBe('Classic T-Shirt / Black / M');
		expect(product.name['vi-VN']).toBe('Classic T-Shirt / Black / M');
	});

	it('identifies the product by its variant id', () => {
		const product = mapVariantRowToKioskProduct({ variantId: '01VARIANT', id: '01SOMETHINGELSE' });

		// A stock line references a variant: it is the concrete thing that is stocked and sold.
		expect(product.id).toBe('01VARIANT');
	});

	it('reads the variant-owned barcode', () => {
		const product = mapVariantRowToKioskProduct({ id: '01VARIANT', primaryBarcode: '8931234567890' });

		expect(product.barcode).toBe('8931234567890');
	});
});

describe('sellPriceFromProposedPrice', () => {
	/**
	 * The heart of the fix. An empty seed leaves the modal's NumberInput blank, so the operator
	 * has to enter a price; a `0` seed looks like a real answer and gets saved unchanged.
	 */
	it('seeds an empty field when the product has no price', () => {
		expect(sellPriceFromProposedPrice(undefined)).toBe('');
		expect(sellPriceFromProposedPrice('')).toBe('');
	});

	it('seeds the catalogue price when there is one', () => {
		expect(sellPriceFromProposedPrice('15000')).toBe(15000);
	});

	it('refuses a malformed or negative price rather than seeding zero', () => {
		expect(sellPriceFromProposedPrice('not-a-number')).toBe('');
		expect(sellPriceFromProposedPrice('-100')).toBe('');
	});

	it('floors a fractional price, since stock prices are whole dong', () => {
		expect(sellPriceFromProposedPrice('15000.75')).toBe(15000);
	});
});

describe('formatCatalogPrice', () => {
	const format = (value: number) => `${value} d`;

	it('shows a dash rather than 0 when the product has no price', () => {
		expect(formatCatalogPrice(undefined, format)).toBe('—');
		expect(formatCatalogPrice('', format)).toBe('—');
	});

	it('formats a real price', () => {
		expect(formatCatalogPrice('15000', format)).toBe('15000 d');
	});

	it('still formats a genuine zero price', () => {
		expect(formatCatalogPrice('0', format)).toBe('0 d');
	});
});
