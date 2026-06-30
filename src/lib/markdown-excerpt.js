export function markdownToExcerpt(markdown, maxLength = 200) {
	if (!markdown) return "";

	const plain = markdown
		.replace(/^::(audio|video|image|pdf|callout|quote)\[[^\]]+\](\{[^}]*\})?$/gm, "")
		.replace(/^```[\s\S]*?```/gm, "")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/[#*_~>-]/g, "")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/\n+/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (plain.length <= maxLength) return plain;
	const truncated = plain.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");
	return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim() + "…";
}
