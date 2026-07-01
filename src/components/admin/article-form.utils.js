const PRIMARY_CATEGORY_MARKER = /<!--\s*primary-category:\s*([^>]+?)\s*-->/i;

export function readDraftFromStorage(storageKey) {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(storageKey);
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		return parsed;
	} catch {
		window.localStorage.removeItem(storageKey);
		return null;
	}
}

export function extractPrimaryCategory(content = "") {
	const match = content.match(PRIMARY_CATEGORY_MARKER);
	return match?.[1]?.trim() || "";
}

export function stripPrimaryCategoryMarker(content = "") {
	return content.replace(PRIMARY_CATEGORY_MARKER, "").trimStart();
}

export function injectPrimaryCategoryMarker(content = "", primaryCategoryPath = "") {
	const clean = stripPrimaryCategoryMarker(content);
	if (!primaryCategoryPath) return clean;
	return `<!-- primary-category: ${primaryCategoryPath} -->\n${clean}`;
}
