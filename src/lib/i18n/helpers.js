/**
 * Combines structural program data (slug, img, video, icon)
 * with locale-specific translations (titles, descriptions).
 *
 * Returns an array of fully hydrated program objects.
 */
export function hydratePrograms(programs, translations) {
	return programs.map((p) => ({
		...p,
		...(translations[p.id] ?? {}),
	}));
}
