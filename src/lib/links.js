export function localizedHref(locale, path) {
	return locale === "fr" ? path : `/${locale}${path}`;
}
