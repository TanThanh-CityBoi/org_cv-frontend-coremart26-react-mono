export type LanguageCode = 'en-US' | 'vi-VN';
export type LocalizedName = {
	[key in LanguageCode]: string
};

export const i18nToLocalizedKey: Record<string, keyof LocalizedName> = {
	en: 'en-US',
	vi: 'vi-VN',
};

export const getLocalizedName = (name?: LocalizedName, i18nLang?: string): string => {
	if (!name) return '';
	if (i18nLang) {
		const localizedKey = i18nToLocalizedKey?.[i18nLang] ?? i18nLang;
		return name[localizedKey] ?? '';
	}
	return name['vi-VN'] ?? name['en-US'] ?? '';
};