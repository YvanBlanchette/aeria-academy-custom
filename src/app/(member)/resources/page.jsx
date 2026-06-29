import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, FileText, Crown } from "lucide-react";
import { canAccessArticle } from "@/lib/article-access";

export const metadata = {
	title: "Ressources | ÆRIA Voyages Academy",
	description: "Articles, audio et vidéos exclusifs pour les conseillers en voyages",
};

const tierBadges = {
	FREE: { label: "Gratuit", variant: "secondary" },
	ACADEMY: { label: "Académie", variant: "default" },
	PRIME: { label: "Prime", variant: "outline" },
};

export default async function ResourcesPage({ searchParams }) {
	const session = await auth();
	if (!session) redirect("/login?callbackUrl=/resources");

	const params = await searchParams;
	const selectedTagSlug = params?.tag || null;

	// Récupère tous les tags pour les filtres
	const allTags = await prisma.tag.findMany({
		include: { _count: { select: { articles: true } } },
		orderBy: { name: "asc" },
	});

	// Construit le where pour les articles
	const where = {
		published: true,
		...(selectedTagSlug && {
			tags: { some: { tag: { slug: selectedTagSlug } } },
		}),
	};

	const articles = await prisma.article.findMany({
		where,
		include: {
			tags: { include: { tag: true } },
			author: { select: { name: true, image: true } },
		},
		orderBy: { publishedAt: "desc" },
	});

	const selectedTag = selectedTagSlug ? allTags.find((t) => t.slug === selectedTagSlug) : null;

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			{/* Filtres par tag */}
			{allTags.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-8">
					<Link
						href="/resources"
						className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
							!selectedTagSlug ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
						}`}
					>
						Tous
					</Link>
					{allTags.map((tag) => (
						<Link
							key={tag.id}
							href={`/resources?tag=${tag.slug}`}
							className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
								selectedTagSlug === tag.slug ? "border-primary text-primary-foreground" : "hover:bg-muted"
							}`}
							style={selectedTagSlug === tag.slug && tag.color ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" } : undefined}
						>
							{tag.name}
							{tag._count.articles > 0 && <span className="ml-1 text-xs opacity-75">({tag._count.articles})</span>}
						</Link>
					))}
				</div>
			)}

			{articles.length === 0 ? (
				<Card>
					<CardContent className="p-16 text-center space-y-4">
						<FileText className="h-12 w-12 text-muted-foreground/40 mx-auto" />
						<p className="text-muted-foreground">
							{selectedTagSlug ? "Aucun article dans cette catégorie pour le moment." : "Aucune ressource disponible pour le moment."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => {
						const access = canAccessArticle(session.user, article);
						const tierBadge = tierBadges[article.requiredTier];

						return (
							<Link
								key={article.id}
								href={`/resources/${article.slug}`}
								className="group"
							>
								<Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
									{article.coverImage ? (
										<div className="relative aspect-video w-full overflow-hidden bg-muted -translate-y-4">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={article.coverImage}
												alt={article.title}
												className="h-full w-full object-cover"
											/>
											{!access.allowed && (
												<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
													<div className="flex flex-col items-center gap-2 text-white">
														<Lock className="h-8 w-8" />
														<span className="text-sm font-medium">{article.requiredTier === "PRIME" ? "Prime" : "Académie"}</span>
													</div>
												</div>
											)}
										</div>
									) : (
										<div className="relative aspect-video w-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
											<FileText className="h-10 w-10 text-muted-foreground/40" />
											{!access.allowed && (
												<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
													<div className="flex flex-col items-center gap-2 text-white">
														<Lock className="h-8 w-8" />
														<span className="text-sm font-medium">{article.requiredTier === "PRIME" ? "Prime" : "Académie"}</span>
													</div>
												</div>
											)}
										</div>
									)}

									<CardContent className="p-5 space-y-3">
										{/* Tags */}
										<div className="flex flex-wrap gap-1.5">
											{article.tags.slice(0, 2).map(({ tag }) => (
												<Badge
													key={tag.id}
													variant="outline"
													className="text-xs"
													style={
														tag.color
															? {
																	backgroundColor: tag.color,
																	color: "#fff",
																	borderColor: tag.color,
																}
															: undefined
													}
												>
													{tag.name}
												</Badge>
											))}
											{article.requiredTier !== "FREE" && (
												<Badge
													variant={tierBadge.variant}
													className="text-xs gap-1"
												>
													{article.requiredTier === "PRIME" && <Crown className="h-3 w-3" />}
													{tierBadge.label}
												</Badge>
											)}
										</div>

										{/* Titre */}
										<h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>

										{/* Excerpt */}
										{article.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>}

										{/* Footer */}
										<div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
											<span>{article.author.name}</span>
											<time>
												{new Date(article.publishedAt).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</time>
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
