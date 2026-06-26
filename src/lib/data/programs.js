/**
 * Learning programs — single source of truth for structural data.
 *
 * Add a new program by adding an entry here. Then add its translations
 * to `i18n/en.js` and `i18n/fr.js` under `programs.<id>`.
 *
 * `id` must match the key used in the translation files.
 * `slug` drives the URL: /[locale]/<slug>
 */
export const programs = [
	{
		id: "cruises",
		slug: "cruises",
		img: "/images/cruises-poster.webp",
		video: "/videos/cruises.webm",
		icon: "/images/ship-icon.svg",
	},
	{
		id: "destinations",
		slug: "destinations",
		img: "/images/destinations-poster.webp",
		video: "/videos/destinations.webm",
		icon: "/images/globe-icon.svg",
	},
	{
		id: "tours",
		slug: "tours",
		img: "/images/tours-poster.webp",
		video: "/videos/tours.webm",
		icon: "/images/map-icon.svg",
	},
];

// Helper for lookups by id
export const getProgramById = (id) => programs.find((p) => p.id === id);
