export function formatSocialRelativeTime(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const safeDiffMs = Math.max(0, diffMs);
	const minuteMs = 60 * 1000;
	const hourMs = 60 * minuteMs;
	const dayMs = 24 * hourMs;

	if (safeDiffMs < minuteMs) return "A l'instant";

	const minutes = Math.floor(safeDiffMs / minuteMs);
	if (minutes < 60) return `${minutes} min`;

	const hours = Math.floor(safeDiffMs / hourMs);
	if (hours < 24) return `${hours} h`;

	const days = Math.floor(safeDiffMs / dayMs);
	if (days < 7) return `${days} j`;

	const sameYear = now.getFullYear() === date.getFullYear();
	return new Intl.DateTimeFormat("fr-CA", {
		day: "numeric",
		month: "short",
		...(sameYear ? {} : { year: "numeric" }),
	}).format(date);
}
