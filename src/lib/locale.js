export const LOCALE_COOKIE_NAME = "locale";
export const DEFAULT_LOCALE = "fr";
export const SUPPORTED_LOCALES = ["fr", "en"];

export function normalizeLocale(value) {
	if (SUPPORTED_LOCALES.includes(value)) return value;
	return DEFAULT_LOCALE;
}

export function getLocaleFromCookie(cookieStore) {
	const rawValue = cookieStore?.get(LOCALE_COOKIE_NAME)?.value;
	return normalizeLocale(rawValue);
}
