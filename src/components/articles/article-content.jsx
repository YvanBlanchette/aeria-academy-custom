import { renderArticleContent } from "@/lib/article-renderer";

export function ArticleContent({ content, className = "" }) {
	const html = renderArticleContent(content);

	return (
		<div
			className={`prose prose-stone max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground ${className}`}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
