import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArticleRowActions } from "@/components/admin/article-row-actions";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, FileText, Search, Tags, TrendingUp } from "lucide-react";

export const metadata = { title: "Articles — AERIA Admin" };

const PAGE_SIZE = 12;
const SORT_FIELDS = ["title", "status", "tier", "updatedAt", "publishedAt", "viewCount"];

const tierColors = {
	FREE: "outline",
	ACADEMY: "default",
	PRIME: "secondary",
};

function parseArticleParams(params) {
	const q = typeof params?.q === "string" ? params.q.trim() : "";
	const status = params?.status === "published" || params?.status === "draft" ? params.status : "all";
	const tier = ["FREE", "ACADEMY", "PRIME"].includes(params?.tier) ? params.tier : "all";
	const tag = typeof params?.tag === "string" ? params.tag.trim().toLowerCase() : "";
	const sort = SORT_FIELDS.includes(params?.sort) ? params.sort : "updatedAt";
	const dir = params?.dir === "asc" || params?.dir === "desc" ? params.dir : "desc";
	const rawPage = Number(params?.page);
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
	return { q, status, tier, tag, sort, dir, page };
}

function SortHeaderLink({ href, label, active, dir }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center justify-center gap-1 hover:opacity-90"
		>
			<span>{label}</span>
			{active ? dir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5" />}
		</Link>
	);
}

export default async function AdminArticlesPage({ searchParams }) {
	const params = await searchParams;
	const { q, status, tier, tag, sort, dir, page } = parseArticleParams(params);

	const where = {
		...(status === "draft" ? { published: false } : status === "published" ? { published: true } : {}),
		...(tier !== "all" ? { requiredTier: tier } : {}),
		...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
		...(q
			? {
					OR: [
						{ title: { contains: q, mode: "insensitive" } },
						{ slug: { contains: q, mode: "insensitive" } },
						{ excerpt: { contains: q, mode: "insensitive" } },
						{ content: { contains: q, mode: "insensitive" } },
						{ author: { name: { contains: q, mode: "insensitive" } } },
					],
				}
			: {}),
	};

	const orderBy =
		sort === "title"
			? [{ title: dir }, { updatedAt: "desc" }]
			: sort === "status"
				? [{ published: dir }, { updatedAt: "desc" }]
				: sort === "tier"
					? [{ requiredTier: dir }, { updatedAt: "desc" }]
					: sort === "publishedAt"
						? [{ publishedAt: dir }, { updatedAt: "desc" }]
						: sort === "viewCount"
							? [{ viewCount: dir }, { updatedAt: "desc" }]
							: [{ updatedAt: dir }];

	const [articles, filteredCount, totalCount, publishedCount, draftCount, freeCount, academyCount, primeCount, allTags] = await Promise.all([
		prisma.article.findMany({
			where,
			include: {
				author: { select: { name: true, email: true } },
				tags: { include: { tag: true } },
			},
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
		}),
		prisma.article.count({ where }),
		prisma.article.count(),
		prisma.article.count({ where: { published: true } }),
		prisma.article.count({ where: { published: false } }),
		prisma.article.count({ where: { requiredTier: "FREE" } }),
		prisma.article.count({ where: { requiredTier: "ACADEMY" } }),
		prisma.article.count({ where: { requiredTier: "PRIME" } }),
		prisma.tag.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: { select: { articles: true } },
			},
		}),
	]);

	const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageStart = filteredCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
	const pageEnd = Math.min(safePage * PAGE_SIZE, filteredCount);

	function hrefWith(next) {
		const merged = {
			q,
			status,
			tier,
			tag,
			sort,
			dir,
			page,
			...next,
		};
		const usp = new URLSearchParams();
		if (merged.q) usp.set("q", merged.q);
		if (merged.status !== "all") usp.set("status", merged.status);
		if (merged.tier !== "all") usp.set("tier", merged.tier);
		if (merged.tag) usp.set("tag", merged.tag);
		if (merged.sort !== "updatedAt") usp.set("sort", merged.sort);
		if (merged.dir !== "desc") usp.set("dir", merged.dir);
		if (Number(merged.page) > 1) usp.set("page", String(merged.page));
		const qs = usp.toString();
		return qs ? `/admin/articles?${qs}` : "/admin/articles";
	}

	function sortHref(column) {
		const isCurrent = sort === column;
		const nextDir = isCurrent && dir === "asc" ? "desc" : "asc";
		return hrefWith({ sort: column, dir: nextDir, page: 1 });
	}

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-transparent">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Articles</p>
						<FileText className="h-4 w-4 text-primary" />
					</div>
					<p className="mt-2 text-3xl font-bold">{totalCount}</p>
				</div>
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Publication</p>
						<TrendingUp className="h-4 w-4 text-primary" />
					</div>
					<p className="mt-2 text-3xl font-bold">{publishedCount}</p>
					<p className="text-xs text-muted-foreground">{draftCount} brouillons</p>
				</div>
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Accès</p>
						<Badge variant="outline">tiers</Badge>
					</div>
					<p className="mt-2 text-sm font-medium">
						FREE {freeCount} • ACADEMY {academyCount} • PRIME {primeCount}
					</p>
				</div>
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Résultats filtrés</p>
						<Tags className="h-4 w-4 text-primary" />
					</div>
					<p className="mt-2 text-3xl font-bold">{filteredCount}</p>
				</div>
			</div>

			<h2 className="text-3xl font-bold text-center">Liste des articles</h2>

			<div className="space-y-3 rounded-lg border bg-white p-3">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap justify-start items-center gap-2">
						<Link
							href={hrefWith({ status: "all", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								status === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Tous
						</Link>
						<Link
							href={hrefWith({ status: "draft", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								status === "draft" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Brouillons
							{draftCount > 0 && (
								<Badge
									variant="secondary"
									className="ml-2"
								>
									{draftCount}
								</Badge>
							)}
						</Link>
						<Link
							href={hrefWith({ status: "published", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								status === "published" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Publiés
						</Link>
						<Link
							href={hrefWith({ tier: "FREE", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								tier === "FREE" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							FREE
						</Link>
						<Link
							href={hrefWith({ tier: "ACADEMY", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								tier === "ACADEMY" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							ACADEMY
						</Link>
						<Link
							href={hrefWith({ tier: "PRIME", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								tier === "PRIME" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							PRIME
						</Link>
					</div>

					<div className="flex justify-end items-center gap-2">
						<form
							action="/admin/articles"
							className="relative"
						>
							<Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<input
								type="text"
								name="q"
								defaultValue={q}
								placeholder="Rechercher un article"
								className="h-9 rounded-full bg-neutral-50 shadow-inner border pl-8 pr-3 text-sm"
							/>
							{status !== "all" ? (
								<input
									type="hidden"
									name="status"
									value={status}
								/>
							) : null}
							{tier !== "all" ? (
								<input
									type="hidden"
									name="tier"
									value={tier}
								/>
							) : null}
							{tag ? (
								<input
									type="hidden"
									name="tag"
									value={tag}
								/>
							) : null}
						</form>
						<Link
							href="/admin/articles/new"
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground`}
						>
							+ Nouvel Article
						</Link>
						<Link
							href="/admin/articles/tags"
							className="px-3 py-1.5 rounded-md text-sm font-medium bg-muted hover:bg-muted/70"
						>
							Gérer les tags →
						</Link>
					</div>
				</div>
			</div>

			{articles.length === 0 ? (
				<Card className="p-12 text-center text-muted-foreground">Aucun article pour ces filtres.</Card>
			) : (
				<>
					<div className="rounded-lg border bg-card overflow-hidden">
						<Table>
							<TableHeader className="bg-[#171717] hover:bg-[#171717] text-white hover:pointer-events-none">
								<TableRow>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "title", dir: sort === "title" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Titre"
											active={sort === "title"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">Tags</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "tier", dir: sort === "tier" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Accès"
											active={sort === "tier"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "status", dir: sort === "status" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Statut"
											active={sort === "status"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">Auteur</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "viewCount", dir: sort === "viewCount" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Vues"
											active={sort === "viewCount"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "updatedAt", dir: sort === "updatedAt" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Mis à jour"
											active={sort === "updatedAt"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{articles.map((a) => (
									<TableRow
										key={a.id}
										className="overflow-x-hidden"
									>
										<TableCell className="text-center border">
											<Link
												href={`/admin/articles/${a.id}`}
												className="font-medium hover:underline"
											>
												{a.title}
											</Link>
										</TableCell>
										<TableCell className="text-center border">
											<div className="flex flex-wrap items-center justify-center gap-1">
												{a.tags.length === 0 ? <span className="text-xs text-muted-foreground">—</span> : null}
												{a.tags.map(({ tag: tagItem }) => (
													<Badge
														key={tagItem.id}
														variant="outline"
														style={tagItem.color ? { backgroundColor: tagItem.color, color: "#fff", borderColor: tagItem.color } : undefined}
													>
														{tagItem.name}
													</Badge>
												))}
											</div>
										</TableCell>
										<TableCell className="text-center border">
											<Badge variant={tierColors[a.requiredTier]}>{a.requiredTier}</Badge>
										</TableCell>
										<TableCell className="text-center border">
											<Badge variant={a.published ? "default" : "secondary"}>{a.published ? "Publié" : "Brouillon"}</Badge>
										</TableCell>
										<TableCell className="text-center text-sm border">{a.author?.name || a.author?.email || "-"}</TableCell>
										<TableCell className="text-center text-sm border">{a.viewCount}</TableCell>
										<TableCell className="text-center text-sm text-muted-foreground border">{new Date(a.updatedAt).toLocaleDateString("fr-FR")}</TableCell>
										<TableCell className="text-center border">
											<ArticleRowActions article={a} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{totalPages > 1 ? (
						<div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
							<Button
								variant="outline"
								size="sm"
								disabled={safePage <= 1}
								asChild={safePage > 1}
							>
								{safePage > 1 ? (
									<Link href={hrefWith({ page: safePage - 1 })}>
										<ChevronLeft className="mr-1 h-4 w-4" />
										Précédent
									</Link>
								) : (
									<span>
										<ChevronLeft className="mr-1 h-4 w-4" />
										Précédent
									</span>
								)}
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
								{safePage < totalPages ? (
									<Link href={hrefWith({ page: safePage + 1 })}>
										Suivant
										<ChevronRight className="ml-1 h-4 w-4" />
									</Link>
								) : (
									<span>
										Suivant
										<ChevronRight className="ml-1 h-4 w-4" />
									</span>
								)}
							</Button>
						</div>
					) : null}
				</>
			)}
		</div>
	);
}
