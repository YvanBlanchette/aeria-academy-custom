import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Parse le markdown enrichi avec directives custom :
 *
 * ::audio[url]{caption="..."}
 * ::video[url]                    (youtube, vimeo, ou /uploads/)
 * ::image[url]{caption="..." alt="..."}
 * ::pdf[url]{title="..."}
 * ::callout[contenu]{type="info|warning|tip"}
 * ::quote[contenu]{author="..."}
 */

// Helper : extrait les attributs de la forme {key="value" key2="value2"}
function parseAttributes(attrString) {
	if (!attrString) return {};
	const attrs = {};
	const regex = /(\w+)="([^"]*)"/g;
	let match;
	while ((match = regex.exec(attrString)) !== null) {
		attrs[match[1]] = match[2];
	}
	return attrs;
}

// Helper : détecte YouTube/Vimeo
function getVideoEmbedUrl(url) {
	if (!url) return null;

	// YouTube : youtu.be/ID ou youtube.com/watch?v=ID
	const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
	if (ytMatch) {
		return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
	}

	// Vimeo
	const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
	if (vimeoMatch) {
		return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
	}

	// Fichier local /uploads/
	if (url.startsWith("/uploads/") || url.startsWith("http")) {
		return { type: "file", embedUrl: url };
	}

	return null;
}

// Transforme les directives custom en HTML AVANT le parse markdown
function expandDirectives(markdown) {
	let output = markdown;

	// ::audio[url]{attrs}
	output = output.replace(/^::audio\[([^\]]+)\](\{[^}]*\})?$/gm, (_, url, attrsRaw) => {
		const attrs = parseAttributes(attrsRaw);
		const caption = attrs.caption || "";
		return `
<figure class="my-6 rounded-lg border bg-muted/30 p-4">
  <audio controls preload="metadata" class="w-full">
    <source src="${url}" />
    Votre navigateur ne supporte pas l'audio.
  </audio>
  ${caption ? `<figcaption class="mt-2 text-sm text-muted-foreground text-center">${caption}</figcaption>` : ""}
</figure>
`;
	});

	// ::video[url]{attrs}
	output = output.replace(/^::video\[([^\]]+)\](\{[^}]*\})?$/gm, (_, url, attrsRaw) => {
		const attrs = parseAttributes(attrsRaw);
		const caption = attrs.caption || "";
		const video = getVideoEmbedUrl(url);

		if (!video) return `<p><em>Vidéo invalide : ${url}</em></p>`;

		let player;
		if (video.type === "youtube" || video.type === "vimeo") {
			player = `<iframe src="${video.embedUrl}" allowfullscreen class="absolute inset-0 h-full w-full"></iframe>`;
		} else {
			player = `<video controls preload="metadata" class="absolute inset-0 h-full w-full" src="${video.embedUrl}"></video>`;
		}

		return `
<figure class="my-6">
  <div class="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
    ${player}
  </div>
  ${caption ? `<figcaption class="mt-2 text-sm text-muted-foreground text-center">${caption}</figcaption>` : ""}
</figure>
`;
	});

	// ::image[url]{attrs}
	output = output.replace(/^::image\[([^\]]+)\](\{[^}]*\})?$/gm, (_, url, attrsRaw) => {
		const attrs = parseAttributes(attrsRaw);
		const caption = attrs.caption || "";
		const alt = attrs.alt || caption || "Image";
		return `
<figure class="my-6">
  <img src="${url}" alt="${alt}" class="w-full rounded-lg" loading="lazy" />
  ${caption ? `<figcaption class="mt-2 text-sm text-muted-foreground text-center italic">${caption}</figcaption>` : ""}
</figure>
`;
	});

	// ::pdf[url]{title="..."}
	output = output.replace(/^::pdf\[([^\]]+)\](\{[^}]*\})?$/gm, (_, url, attrsRaw) => {
		const attrs = parseAttributes(attrsRaw);
		const title = attrs.title || "Document PDF";
		return `
<a href="${url}" target="_blank" rel="noopener noreferrer" class="my-6 flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted no-underline">
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  <div class="flex-1">
    <p class="font-medium">${title}</p>
    <p class="text-xs text-muted-foreground">Cliquer pour ouvrir le PDF</p>
  </div>
</a>
`;
	});

	// ::callout[contenu]{type="info|warning|tip"}
	output = output.replace(/^::callout\[([^\]]+)\](\{[^}]*\})?$/gm, (_, content, attrsRaw) => {
		const attrs = parseAttributes(attrsRaw);
		const type = attrs.type || "info";
		const styles = {
			info: "border-blue-200 bg-blue-50 text-blue-900",
			warning: "border-amber-200 bg-amber-50 text-amber-900",
			tip: "border-green-200 bg-green-50 text-green-900",
		};
		const style = styles[type] || styles.info;
		return `<div class="my-6 rounded-lg border ${style} p-4">${content}</div>`;
	});

	// ::quote[contenu]{author="..."}
	output = output.replace(/^::quote\[([^\]]+)\](\{[^}]*\})?$/gm, (_, content, attrsRaw) => {
		const attrs = parseAttributes(attrsRaw);
		const author = attrs.author || "";
		return `
<blockquote class="my-6 border-l-4 border-primary pl-4 italic">
  <p>${content}</p>
  ${author ? `<cite class="mt-2 block text-sm not-italic text-muted-foreground">— ${author}</cite>` : ""}
</blockquote>
`;
	});

	return output;
}

/**
 * Convertit le markdown enrichi en HTML safe (sanitized).
 * À utiliser côté serveur uniquement.
 */
export function renderArticleContent(markdown) {
	if (!markdown) return "";

	// 1. Expand les directives custom
	const expanded = expandDirectives(markdown);

	// 2. Parse le markdown standard
	marked.setOptions({
		breaks: true, // \n → <br>
		gfm: true, // GitHub Flavored Markdown
	});
	const html = marked.parse(expanded);

	// 3. Sanitize pour la sécurité (autorise iframe pour YouTube/Vimeo)
	const safe = DOMPurify.sanitize(html, {
		ADD_TAGS: ["iframe", "audio", "video", "source"],
		ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "controls", "preload", "loading"],
	});

	return safe;
}

/**
 * Génère un excerpt automatique depuis le markdown (sans les directives).
 * Utile si l'admin n'en a pas fourni un manuellement.
 */
export function generateExcerpt(markdown, maxLength = 200) {
	if (!markdown) return "";

	const plain = markdown
		.replace(/^::(audio|video|image|pdf|callout|quote)\[[^\]]+\](\{[^}]*\})?$/gm, "") // retire directives
		.replace(/[#*_`~]/g, "") // retire markdown syntax
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "") // retire images
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // garde texte des liens
		.replace(/\n+/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (plain.length <= maxLength) return plain;

	const truncated = plain.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");
	return truncated.slice(0, lastSpace) + "…";
}
