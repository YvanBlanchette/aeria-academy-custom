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
		<DashboardLayoutRight
			title="Articles"
			subtitle={`${articles.length} article(s)`}
			btnLabel="+ Nouvel article"
			btnLink="/admin/articles/new"
		>
			<div className="flex gap-2 mb-6">
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
				<Link
					href="/admin/articles/tags"
					className="ml-auto px-3 py-1.5 rounded-md text-sm font-medium bg-muted hover:bg-muted/70"
				>
					Gérer les tags →
				</Link>
			</div>

			{articles.length === 0 ? (
				<Card className="p-12 text-center text-muted-foreground">
					Aucun article {filter === "draft" ? "en brouillon" : filter === "published" ? "publié" : ""}
				</Card>
			) : (
				<div className="rounded-lg border bg-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Titre</TableHead>
								<TableHead>Tags</TableHead>
								<TableHead>Accès</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead>Auteur</TableHead>
								<TableHead>Mis à jour</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{articles.map((a) => (
								<TableRow key={a.id}>
									<TableCell>
										<Link
											href={`/admin/articles/${a.id}`}
											className="font-medium hover:underline"
										>
											{a.title}
										</Link>
										<p className="text-xs text-muted-foreground">/{a.slug}</p>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{a.tags.map(({ tag }) => (
												<Badge
													key={tag.id}
													variant="outline"
													style={tag.color ? { backgroundColor: tag.color, color: "#fff", borderColor: tag.color } : undefined}
												>
													{tag.name}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={tierColors[a.requiredTier]}>{a.requiredTier}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={a.published ? "default" : "secondary"}>{a.published ? "Publié" : "Brouillon"}</Badge>
									</TableCell>
									<TableCell className="text-sm">{a.author.name}</TableCell>
									<TableCell className="text-sm text-muted-foreground">{new Date(a.updatedAt).toLocaleDateString("fr-FR")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</DashboardLayoutRight>
	);
}
