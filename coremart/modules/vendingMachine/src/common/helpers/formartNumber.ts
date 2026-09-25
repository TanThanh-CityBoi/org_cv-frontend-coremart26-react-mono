import { i18nToLocalizedKey, LanguageCode } from './getLocalizedName';


export enum Currency {
	VND = 'VND',
	USD = 'USD',
}

export const currencyToSymbol: Record<Currency, string> = {
	[Currency.VND]: '₫',
	[Currency.USD]: '$',
};

export const localeToCurrency: Record<string, Currency> = {
	'vi-VN': Currency.VND,
	'en-US': Currency.USD,
};

export const getLocaleByI18nLang = (i18nLang: string): LanguageCode => {
	return i18nToLocalizedKey?.[i18nLang] ?? 'vi-VN';
};

export const getCurrencyByLocale = (locale: LanguageCode): Currency => {
	return localeToCurrency?.[locale] ?? Currency.VND;
};

function currencyToLocale(currency: Currency): LanguageCode {
	switch (currency) {
		case Currency.VND:
			return 'vi-VN';
		case Currency.USD:
			return 'en-US';
		default:
			return 'vi-VN';
	}
}
export function fmtCurrency(raw: number | string, currency: Currency = Currency.VND): string {
	const nf = new Intl.NumberFormat(currencyToLocale(currency), { style: 'currency', currency });
	const n = Number(raw);
	return Number.isFinite(n) ? nf.format(n) : String(raw);
}


export function fmtNumber(raw: number | string, locale: LanguageCode = 'vi-VN'): string | null {
	if (raw === undefined || raw === null) return null;
	const nf = new Intl.NumberFormat(locale);
	const n = Number(raw);
	return Number.isFinite(n) ? nf.format(n) : String(raw);
}


const COMPACT_FORMAT_OPTIONS = {
	notation: 'compact',
	compactDisplay: 'short',
	maximumFractionDigits: 3,
} as const satisfies Intl.NumberFormatOptions;

export function fmtShortNumber(raw: number | string, locale: LanguageCode = 'vi-VN'): string | null {
	if (raw === undefined || raw === null) return null;
	const n = Number(raw);
	if (!Number.isFinite(n)) return String(raw);
	return new Intl.NumberFormat(locale, COMPACT_FORMAT_OPTIONS).format(n);
}

export function fmtShortCurrency(raw: number | string, currency: Currency = Currency.VND): string {
	const n = Number(raw);
	if (!Number.isFinite(n)) return String(raw);
	const locale = currencyToLocale(currency);
	return new Intl.NumberFormat(locale, {
		...COMPACT_FORMAT_OPTIONS,
		style: 'currency',
		currency,
	}).format(n);
}