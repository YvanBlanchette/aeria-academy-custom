import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleForm } from "@/components/admin/article-form";
import { ArticleActions } from "@/components/admin/article-actions";

export default async function AdminArticleDetailPage({ params }) {
	const { id } = await params;

	const article = await prisma.article.findUnique({
		where: { id },
		include: {
			tags: { include: { tag: true } },
			author: { select: { name: true, email: true } },
		},
	});

	if (!article) notFound();

	const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

	return (
		<DashboardLayoutRight
			title={article.title}
			subtitle={article.published ? "Article publié" : "Brouillon"}
		>
			<div className="mb-4">
				<Link
					href="/admin/articles"
					className="text-sm text-muted-foreground hover:underline"
				>
					← Retour aux articles
				</Link>
			</div>

			<Card className="mb-6">
				<CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
					<div className="flex items-center gap-3">
						<Badge variant={article.published ? "default" : "secondary"}>{article.published ? "Publié" : "Brouillon"}</Badge>
						{article.publishedAt && (
							<p className="text-sm text-muted-foreground">
								Publié le{" "}
								{new Date(article.publishedAt).toLocaleDateString("fr-FR", {
									day: "numeric",
									month: "long",
									year: "numeric",
								})}
							</p>
						)}
					</div>
					<ArticleActions article={article} />
				</CardContent>
			</Card>

			<div className="max-w-4xl">
				<ArticleForm
					article={article}
					allTags={allTags}
				/>
			</div>
		</DashboardLayoutRight>
	);
}
