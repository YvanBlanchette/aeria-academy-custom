import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, FileText, Lock, Search, ShieldCheck, Sparkles } from "lucide-react";
import { canAccessArticle } from "@/lib/article-access";
import { ResourcesViewToggle } from "@/components/users/resources-view-toggle";

export const metadata = {
	title: "Ressources | ÆRIA Voyages Academy",
	description: "Articles, audio et vidéos exclusifs pour les conseillers en voyages",
};

const PAGE_SIZE = 12;
const SORT_FIELDS = ["newest", "oldest", "popular"];

function parseParams(params) {
	const tag = typeof params?.tag === "string" ? params.tag : null;
	const category = typeof params?.category === "string" ? params.category.trim() : "";
	const q = typeof params?.q === "string" ? params.q.trim() : "";
	const access = params?.access === "accessible" || params?.access === "locked" ? params.access : "all";
	const sort = SORT_FIELDS.includes(params?.sort) ? params.sort : "newest";
	const view = params?.view === "cards" || params?.view === "list" ? params.view : null;
	const parsedPage = Number(params?.page);
	const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
	return { tag, category, q, access, sort, view, page };
}

const tierBadges = {
	FREE: { label: "Gratuit", variant: "secondary" },
	ACADEMY: { label: "Académie", variant: "default" },
	PRIME: { label: "Prime", variant: "outline" },
};

export default async function ResourcesPage({ searchParams }) {
	const session = await auth();
	if (!session) redirect("/login?callbackUrl=/resources");

	const params = await searchParams;
	const { tag: selectedTagSlug, category: selectedCategoryPath, q, access, sort, view: queryView, page } = parseParams(params);
	const cookieStore = await cookies();
	const cookieView = cookieStore.get("dashboard_resources_view")?.value;
	const currentView = queryView || (cookieView === "list" || cookieView === "cards" ? cookieView : "cards");

	const allTags = await prisma.tag.findMany({
		include: { _count: { select: { articles: true } } },
		orderBy: { name: "asc" },
	});

	const selectedTag = selectedTagSlug ? allTags.find((t) => t.slug === selectedTagSlug) : null;

	const where = {
		published: true,
		...(selectedTagSlug && {
			tags: { some: { tag: { slug: selectedTagSlug } } },
		}),
		...(selectedCategoryPath && {
			tags: {
				some: {
					tag: {
						name: { startsWith: selectedCategoryPath, mode: "insensitive" },
					},
				},
			},
		}),
		...(q && {
			OR: [
				{ title: { contains: q, mode: "insensitive" } },
				{ excerpt: { contains: q, mode: "insensitive" } },
				{ content: { contains: q, mode: "insensitive" } },
			],
		}),
	};

	const orderBy = sort === "oldest" ? { publishedAt: "asc" } : sort === "popular" ? { viewCount: "desc" } : { publishedAt: "desc" };

	const articlesRaw = await prisma.article.findMany({
		where,
		include: {
			tags: { include: { tag: true } },
			author: { select: { name: true, image: true } },
		},
		orderBy,
		take: 120,
	});

	const articlesWithAccess = articlesRaw.map((article) => ({
		article,
		access: canAccessArticle(session.user, article),
	}));

	const filteredByAccess =
		access === "accessible"
			? articlesWithAccess.filter((item) => item.access.allowed)
			: access === "locked"
				? articlesWithAccess.filter((item) => !item.access.allowed)
				: articlesWithAccess;

	const accessibleCount = articlesWithAccess.filter((item) => item.access.allowed).length;
	const lockedCount = articlesWithAccess.length - accessibleCount;

	const totalFiltered = filteredByAccess.length;
	const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * PAGE_SIZE;
	const pageItems = filteredByAccess.slice(start, start + PAGE_SIZE);
	const pageStart = totalFiltered === 0 ? 0 : start + 1;
	const pageEnd = Math.min(start + PAGE_SIZE, totalFiltered);

	function hrefWith(next) {
		const merged = { tag: selectedTagSlug, category: selectedCategoryPath, q, access, sort, view: currentView, page, ...next };
		const usp = new URLSearchParams();
		if (merged.tag) usp.set("tag", merged.tag);
		if (merged.category) usp.set("category", merged.category);
		if (merged.q) usp.set("q", merged.q);
		if (merged.access && merged.access !== "all") usp.set("access", merged.access);
		if (merged.sort && merged.sort !== "newest") usp.set("sort", merged.sort);
		if (merged.view && merged.view !== "cards") usp.set("view", merged.view);
		if (merged.page && Number(merged.page) > 1) usp.set("page", String(merged.page));
		const qs = usp.toString();
		return qs ? `/resources?${qs}` : "/resources";
	}

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
			<div className="rounded-xl border bg-card p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Bibliothèque membre</p>
						<h1 className="text-2xl font-semibold">Ressources</h1>
						<p className="text-sm text-muted-foreground mt-1">Analyses, guides opérationnels et contenus exclusifs pour progresser plus vite.</p>
					</div>
					<div className="grid grid-cols-3 gap-2 text-center">
						<div className="rounded-md border bg-background px-3 py-2">
							<p className="text-xs text-muted-foreground">Total</p>
							<p className="text-lg font-semibold">{articlesWithAccess.length}</p>
						</div>
						<div className="rounded-md border bg-background px-3 py-2">
							<p className="text-xs text-muted-foreground">Accès</p>
							<p className="text-lg font-semibold">{accessibleCount}</p>
						</div>
						<div className="rounded-md border bg-background px-3 py-2">
							<p className="text-xs text-muted-foreground">Premium</p>
							<p className="text-lg font-semibold">{lockedCount}</p>
						</div>
					</div>
				</div>
				{selectedCategoryPath ? (
					<div className="mt-3 inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm">
						<span className="text-muted-foreground">Filtre catégorie:</span>
						<span className="font-medium">{selectedCategoryPath}</span>
						<Link
							href={hrefWith({ category: null, page: 1 })}
							className="text-muted-foreground hover:text-foreground"
						>
							×
						</Link>
					</div>
				) : null}
			</div>

			{allTags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					<Link
						href={hrefWith({ tag: null, category: null, page: 1 })}
						className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
							!selectedTagSlug && !selectedCategoryPath ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
						}`}
					>
						Tous
					</Link>
					{allTags.map((tag) => (
						<Link
							key={tag.id}
							href={hrefWith({ tag: tag.slug, category: null, page: 1 })}
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

			<div className="rounded-lg border bg-card p-3 space-y-3">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<div className="flex flex-wrap items-center gap-2">
							<Link
								href={hrefWith({ access: "all", page: 1 })}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${access === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
							>
								Tous
							</Link>
							<Link
								href={hrefWith({ access: "accessible", page: 1 })}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${access === "accessible" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
							>
								<span className="inline-flex items-center gap-1">
									<ShieldCheck className="h-3.5 w-3.5" /> Accès inclus
								</span>
							</Link>
							<Link
								href={hrefWith({ access: "locked", page: 1 })}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${access === "locked" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
							>
								<span className="inline-flex items-center gap-1">
									<Lock className="h-3.5 w-3.5" /> Premium
								</span>
							</Link>
						</div>

						<ResourcesViewToggle
							currentView={currentView}
							cardsHref={hrefWith({ view: "cards" })}
							listHref={hrefWith({ view: "list" })}
						/>
					</div>

					<form
						action="/resources"
						className="relative"
					>
						<Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							name="q"
							defaultValue={q}
							placeholder="Rechercher une ressource"
							className="h-9 rounded-md border bg-background pl-8 pr-3 text-sm"
						/>
						{selectedTagSlug ? (
							<input
								type="hidden"
								name="tag"
								value={selectedTagSlug}
							/>
						) : null}
						{selectedCategoryPath ? (
							<input
								type="hidden"
								name="category"
								value={selectedCategoryPath}
							/>
						) : null}
						{access !== "all" ? (
							<input
								type="hidden"
								name="access"
								value={access}
							/>
						) : null}
						{currentView !== "cards" ? (
							<input
								type="hidden"
								name="view"
								value={currentView}
							/>
						) : null}
					</form>
				</div>

				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<p>{totalFiltered === 0 ? "Aucun résultat" : `${pageStart}-${pageEnd} sur ${totalFiltered} ressources`}</p>
					<div className="flex items-center gap-2">
						<span>Trier:</span>
						<Link
							href={hrefWith({ sort: "newest", page: 1 })}
							className={`px-2 py-1 rounded ${sort === "newest" ? "bg-muted text-foreground" : "hover:bg-muted/70"}`}
						>
							Récents
						</Link>
						<Link
							href={hrefWith({ sort: "oldest", page: 1 })}
							className={`px-2 py-1 rounded ${sort === "oldest" ? "bg-muted text-foreground" : "hover:bg-muted/70"}`}
						>
							Anciens
						</Link>
						<Link
							href={hrefWith({ sort: "popular", page: 1 })}
							className={`px-2 py-1 rounded ${sort === "popular" ? "bg-muted text-foreground" : "hover:bg-muted/70"}`}
						>
							Populaires
						</Link>
					</div>
				</div>
			</div>

			{pageItems.length === 0 ? (
				<Card>
					<CardContent className="p-16 text-center space-y-4">
						<FileText className="h-12 w-12 text-muted-foreground/40 mx-auto" />
						<p className="text-muted-foreground">
							{selectedTagSlug || selectedCategoryPath ? "Aucune ressource dans cette catégorie." : "Aucune ressource disponible pour le moment."}
						</p>
						{q || access !== "all" || selectedTag || selectedCategoryPath ? (
							<Button
								asChild
								variant="outline"
							>
								<Link href="/resources">Réinitialiser les filtres</Link>
							</Button>
						) : null}
					</CardContent>
				</Card>
			) : (
				<>
					{currentView === "list" ? (
						<div className="space-y-3">
							{pageItems.map(({ article, access }) => {
								const tierBadge = tierBadges[article.requiredTier];
								return (
									<Link
										key={article.id}
										href={`/resources/${article.slug}`}
										className="group block"
									>
										<Card className="transition-all hover:shadow-md">
											<CardContent className="p-4">
												<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
													<div className="space-y-2">
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
															<Badge
																variant={access.allowed ? "outline" : "secondary"}
																className="text-xs gap-1"
															>
																{access.allowed ? <ShieldCheck className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
																{access.allowed ? "Accès" : "Premium"}
															</Badge>
														</div>

														<h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{article.title}</h3>
														{article.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}
													</div>

													<div className="text-xs text-muted-foreground shrink-0 md:text-right md:pt-1">
														<p>{article.author.name}</p>
														<time>
															{new Date(article.publishedAt).toLocaleDateString("fr-FR", {
																day: "numeric",
																month: "short",
																year: "numeric",
															})}
														</time>
													</div>
												</div>
											</CardContent>
										</Card>
									</Link>
								);
							})}
						</div>
					) : (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{pageItems.map(({ article, access }) => {
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
												<div className="relative aspect-video w-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center -translate-y-4">
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
													{access.allowed ? (
														<Badge
															variant="outline"
															className="text-xs gap-1"
														>
															<ShieldCheck className="h-3 w-3" /> Accès
														</Badge>
													) : null}
												</div>

												<h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
												{article.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>}

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

					{totalPages > 1 ? (
						<div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
							<Button
								variant="outline"
								size="sm"
								disabled={safePage <= 1}
								asChild={safePage > 1}
							>
								{safePage > 1 ? <Link href={hrefWith({ page: safePage - 1 })}>Précédent</Link> : <span>Précédent</span>}
							</Button>

							<div className="text-sm text-muted-foreground">
								Page <span className="font-medium text-foreground">{safePage}</span> / {totalPages}
							</div>

							<Button
								variant="outline"
								size="sm"
								disabled={safePage >= totalPages}
								asChild={safePage < totalPages}
							>
								{safePage < totalPages ? <Link href={hrefWith({ page: safePage + 1 })}>Suivant</Link> : <span>Suivant</span>}
							</Button>
						</div>
					) : null}

					{lockedCount > 0 ? (
						<Card className="border-amber-300 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/40">
							<CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-medium inline-flex items-center gap-2">
										<Sparkles className="h-4 w-4 text-amber-600" /> Ressources premium disponibles
									</p>
									<p className="text-sm text-muted-foreground">Débloque {lockedCount} ressource(s) supplémentaire(s) avec un abonnement supérieur.</p>
								</div>
								<Button asChild>
									<Link href="/pricing">Voir les abonnements</Link>
								</Button>
							</CardContent>
						</Card>
					) : null}
				</>
			)}
		</div>
	);
}
