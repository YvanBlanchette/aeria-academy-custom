export const DEFAULT_PUBLIC_VISIBILITY = {
	showJobTitle: true,
	showCompany: true,
	showBio: true,
	showWebsite: true,
	showSocialLinks: true,
	showAgency: true,
	showCommunityStats: true,
	showCommunityPosts: true,
	showCertificates: true,
	showFollowStats: true,
};

function toBoolean(value, fallback) {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		if (value === "true") return true;
		if (value === "false") return false;
	}
	return fallback;
}

export function normalizePublicVisibility(raw) {
	const source = raw && typeof raw === "object" ? raw : {};
	return {
		showJobTitle: toBoolean(source.showJobTitle, DEFAULT_PUBLIC_VISIBILITY.showJobTitle),
		showCompany: toBoolean(source.showCompany, DEFAULT_PUBLIC_VISIBILITY.showCompany),
		showBio: toBoolean(source.showBio, DEFAULT_PUBLIC_VISIBILITY.showBio),
		showWebsite: toBoolean(source.showWebsite, DEFAULT_PUBLIC_VISIBILITY.showWebsite),
		showSocialLinks: toBoolean(source.showSocialLinks, DEFAULT_PUBLIC_VISIBILITY.showSocialLinks),
		showAgency: toBoolean(source.showAgency, DEFAULT_PUBLIC_VISIBILITY.showAgency),
		showCommunityStats: toBoolean(source.showCommunityStats, DEFAULT_PUBLIC_VISIBILITY.showCommunityStats),
		showCommunityPosts: toBoolean(source.showCommunityPosts, DEFAULT_PUBLIC_VISIBILITY.showCommunityPosts),
		showCertificates: toBoolean(source.showCertificates, DEFAULT_PUBLIC_VISIBILITY.showCertificates),
		showFollowStats: toBoolean(source.showFollowStats, DEFAULT_PUBLIC_VISIBILITY.showFollowStats),
	};
}
