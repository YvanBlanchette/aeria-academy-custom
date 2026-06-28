import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
	title: "Agences — AERIA Admin",
};

export default async function AdminAgenciesPage({ searchParams }) {
	const params = await searchParams;
	const filter = params?.filter || "all"; // all | pending | approved

	const where = filter === "pending" ? { approved: false } : filter === "approved" ? { approved: true } : {};

	const agencies = await prisma.agency.findMany({
		where,
		include: {
			_count: { select: { members: true } },
		},
		orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
	});

	const pendingCount = await prisma.agency.count({ where: { approved: false } });

	return (
		<DashboardLayoutRight
			title="Agences"
			subtitle={`${agencies.length} agence(s) ${filter === "pending" ? "en attente" : filter === "approved" ? "approuvée(s)" : "au total"}`}
		>
			<h2 className="text-3xl font-bold text-center">
				Liste des agences {filter === "pending" ? "en attente" : filter === "approved" ? "approuvées" : "au total"}
			</h2>
			<div className="flex items-center justify-between  mb-4">
				{/* Filtres */}
				<div className="flex gap-2">
					<Link
						href="/admin/agencies"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
						}`}
					>
						Toutes
					</Link>
					<Link
						href="/admin/agencies?filter=pending"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							filter === "pending" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
						}`}
					>
						En attente
						{pendingCount > 0 && (
							<Badge
								variant="destructive"
								className="ml-2"
							>
								{pendingCount}
							</Badge>
						)}
					</Link>
					<Link
						href="/admin/agencies?filter=approved"
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							filter === "approved" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
						}`}
					>
						Approuvées
					</Link>
				</div>
				<Link
					href="/admin/agencies/new"
					className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground`}
				>
					+ Créer une agence
				</Link>
			</div>

			{agencies.length === 0 ? (
				<Card className="p-12 text-center">
					<Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
					<p className="text-muted-foreground">
						{filter === "pending"
							? "Aucune agence en attente de validation"
							: filter === "approved"
								? "Aucune agence approuvée"
								: "Aucune agence pour le moment"}
					</p>
				</Card>
			) : (
				<div className="rounded-lg border bg-white overflow-hidden">
					<Table>
						<TableHeader className="bg-[#171717]  hover:bg-[#171717] text-white hover:pointer-events-none">
							<TableRow>
								<TableHead className="text-white border-r border-white text-center">Agence</TableHead>
								<TableHead className="text-white border-r border-white text-center">Localisation</TableHead>
								<TableHead className="text-white border-r border-white text-center">Membres</TableHead>
								<TableHead className="text-white border-r border-white text-center">Statut</TableHead>
								<TableHead className="text-white border-r border-white text-center">Créée le</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{agencies.map((a) => (
								<TableRow key={a.id}>
									<TableCell className="text-center border">
										<Link
											href={`/admin/agencies/${a.id}`}
											className="flex items-center gap-3 hover:underline"
										>
											{a.logoUrl ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={a.logoUrl}
													alt={a.name}
													className="h-10 w-10 rounded object-cover shrink-0"
												/>
											) : (
												<div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
													<Building2 className="h-5 w-5 text-muted-foreground" />
												</div>
											)}
											<div>
												<p className="font-medium">{a.name}</p>
											</div>
										</Link>
									</TableCell>
									<TableCell className="text-center border">
										{a.city || "—"}
										{a.province && `, ${a.province}`}
									</TableCell>
									<TableCell className="text-center border">{a._count.members}</TableCell>
									<TableCell className="text-center border">
										<Badge variant={a.approved ? "default" : "secondary"}>{a.approved ? "Approuvée" : "En attente"}</Badge>
									</TableCell>
									<TableCell className="text-center border">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</DashboardLayoutRight>
	);
}
