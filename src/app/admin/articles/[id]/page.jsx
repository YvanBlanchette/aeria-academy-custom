import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleForm } from "@/components/admin/article-form";
import { ArticleActions } from "@/components/admin/article-actions";
import { ArrowLeft } from "lucide-react";

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
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<div className="mb-4">
				<Link
					href="/admin/articles"
					className="text-sm text-muted-foreground bg-white hover:translate-x-1 transition-transform active:bg-neutral-200 active:shadow-inner px-4 py-1.5 rounded-full font-medium shadow-sm flex items-center justify-center gap-2 w-fit"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour aux articles
				</Link>
			</div>

			<Card className="mb-6">
				<CardContent className="px-6 flex items-center justify-between flex-wrap gap-4">
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

			<div className="max-w-7xl">
				<ArticleForm
					article={article}
					allTags={allTags}
				/>
			</div>
		</div>
	);
}
