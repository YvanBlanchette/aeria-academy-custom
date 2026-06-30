import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Articles — AERIA Admin" };

const tierColors = {
	FREE: "outline",
	ACADEMY: "default",
	PRIME: "secondary",
};

export default async function AdminArticlesPage({ searchParams }) {
	const params = await searchParams;
	const filter = params?.filter || "all";

	const where = filter === "draft" ? { published: false } : filter === "published" ? { published: true } : {};

	const articles = await prisma.article.findMany({
		where,
		include: {
			author: { select: { name: true, email: true } },
			tags: { include: { tag: true } },
		},
		orderBy: [{ published: "asc" }, { createdAt: "desc" }],
	});

	const draftCount = await prisma.article.count({ where: { published: false } });

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<h2 className="text-3xl font-bold text-center">Liste des articles {filter === "published" ? "publiés" : filter === "draft" ? "brouillons" : ""}</h2>
			<div className="flex items-center justify-between mb-4 w-full">
				{/* Filtres */}
				<div className="flex justify-start items-center gap-2">
					<Link
						href="/admin/articles"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
						}`}
					>
						Tous
					</Link>
					<Link
						href="/admin/articles?filter=draft"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							filter === "draft" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
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
						href="/admin/articles?filter=published"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							filter === "published" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
						}`}
					>
						Publiés
					</Link>
				</div>

				<div className="flex justify-end items-center gap-2">
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

			{articles.length === 0 ? (
				<Card className="p-12 text-center text-muted-foreground">
					Aucun article {filter === "draft" ? "en brouillon" : filter === "published" ? "publié" : ""}
				</Card>
			) : (
				<div className="rounded-lg border bg-card overflow-hidden">
					<Table>
						<TableHeader className="bg-[#171717]  hover:bg-[#171717] text-white hover:pointer-events-none">
							<TableRow>
								<TableHead className="text-white border-r border-white text-center">Titre</TableHead>
								<TableHead className="text-white border-r border-white text-center">Tags</TableHead>
								<TableHead className="text-white border-r border-white text-center">Accès</TableHead>
								<TableHead className="text-white border-r border-white text-center">Statut</TableHead>
								<TableHead className="text-white border-r border-white text-center">Auteur</TableHead>
								<TableHead className="text-white border-r border-white text-center">Mis à jour</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{articles.map((a) => (
								<TableRow key={a.id}>
									<TableCell className="text-center border">
										<Link
											href={`/admin/articles/${a.id}`}
											className="font-medium hover:underline"
										>
											{a.title}
										</Link>
										<p className="text-xs text-muted-foreground">/{a.slug}</p>
									</TableCell>
									<TableCell className="text-center border">
										{a.tags.map(({ tag }) => (
											<Badge
												key={tag.id}
												variant="outline"
												style={tag.color ? { backgroundColor: tag.color, color: "#fff", borderColor: tag.color } : undefined}
											>
												{tag.name}
											</Badge>
										))}
									</TableCell>
									<TableCell className="text-center border">
										<Badge variant={tierColors[a.requiredTier]}>{a.requiredTier}</Badge>
									</TableCell>
									<TableCell className="text-center border">
										<Badge variant={a.published ? "default" : "secondary"}>{a.published ? "Publié" : "Brouillon"}</Badge>
									</TableCell>
									<TableCell className="text-center text-sm">{a.author.name}</TableCell>
									<TableCell className="text-center text-sm text-muted-foreground">{new Date(a.updatedAt).toLocaleDateString("fr-FR")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
