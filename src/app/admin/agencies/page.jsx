import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgencyRowActions } from "@/components/admin/agency-row-actions";
import { ArrowDown, ArrowUp, ArrowUpDown, Building2, ChevronLeft, ChevronRight, Search, ShieldCheck, Users, UserRoundCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 12;
const SORT_FIELDS = ["name", "status", "members", "city", "createdAt"];

function parseFilterParams(params) {
	const q = typeof params?.q === "string" ? params.q.trim() : "";
	const status = params?.status === "pending" || params?.status === "approved" ? params.status : "all";
	const sort = SORT_FIELDS.includes(params?.sort) ? params.sort : "createdAt";
	const dir = params?.dir === "asc" || params?.dir === "desc" ? params.dir : "desc";
	const parsedPage = Number(params?.page);
	const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
	return { q, status, sort, dir, page };
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

export const metadata = {
	title: "Agences — AERIA Admin",
};

export default async function AdminAgenciesPage({ searchParams }) {
	const params = await searchParams;
	const { q, status, sort, dir, page } = parseFilterParams(params);

	const where = {
		...(status === "pending" ? { approved: false } : status === "approved" ? { approved: true } : {}),
		...(q
			? {
					OR: [
						{ name: { contains: q, mode: "insensitive" } },
						{ city: { contains: q, mode: "insensitive" } },
						{ province: { contains: q, mode: "insensitive" } },
						{ email: { contains: q, mode: "insensitive" } },
						{ slug: { contains: q, mode: "insensitive" } },
					],
				}
			: {}),
	};

	const orderBy =
		sort === "name"
			? [{ name: dir }, { createdAt: "desc" }]
			: sort === "status"
				? [{ approved: dir }, { createdAt: "desc" }]
				: sort === "members"
					? [{ members: { _count: dir } }, { createdAt: "desc" }]
					: sort === "city"
						? [{ city: dir }, { createdAt: "desc" }]
						: [{ createdAt: dir }];

	const [agencies, filteredCount, totalCount, approvedCount, pendingCount, totalMembers] = await Promise.all([
		prisma.agency.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			include: {
				_count: { select: { members: true } },
			},
		}),
		prisma.agency.count({ where }),
		prisma.agency.count(),
		prisma.agency.count({ where: { approved: true } }),
		prisma.agency.count({ where: { approved: false } }),
		prisma.userProfile.count({ where: { agencyId: { not: null } } }),
	]);

	const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageStart = filteredCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
	const pageEnd = Math.min(safePage * PAGE_SIZE, filteredCount);

	function hrefWith(next) {
		const merged = {
			q,
			status,
			sort,
			dir,
			page,
			...next,
		};
		const usp = new URLSearchParams();
		if (merged.q) usp.set("q", merged.q);
		if (merged.status && merged.status !== "all") usp.set("status", merged.status);
		if (merged.sort && merged.sort !== "createdAt") usp.set("sort", merged.sort);
		if (merged.dir && merged.dir !== "desc") usp.set("dir", merged.dir);
		if (merged.page && Number(merged.page) > 1) usp.set("page", String(merged.page));
		const qs = usp.toString();
		return qs ? `/admin/agencies?${qs}` : "/admin/agencies";
	}

	function getSortHref(column) {
		const isCurrent = sort === column;
		const nextDir = isCurrent && dir === "asc" ? "desc" : "asc";
		return hrefWith({ sort: column, dir: nextDir, page: 1 });
	}

	const stats = [
		{ label: "Agences", value: totalCount, icon: Building2 },
		{ label: "Approuvées", value: approvedCount, icon: ShieldCheck },
		{ label: "En attente", value: pendingCount, icon: UserRoundCheck },
		{ label: "Membres rattachés", value: totalMembers, icon: Users },
	];

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{stats.map(({ label, value, icon: Icon }) => (
					<div
						key={label}
						className="rounded-lg border bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">{label}</p>
							<Icon className="h-4 w-4 text-primary" />
						</div>
						<p className="mt-2 text-3xl font-bold">{value}</p>
					</div>
				))}
			</div>

			<h2 className="text-3xl font-bold text-center">Gestion des agences</h2>
			<div className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap gap-2">
					<Link
						href={hrefWith({ status: "all" })}
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							status === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
						}`}
					>
						Toutes
					</Link>
					<Link
						href={hrefWith({ status: "pending" })}
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							status === "pending" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
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
						href={hrefWith({ status: "approved" })}
						className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							status === "approved" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
						}`}
					>
						Approuvées
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<form
						action="/admin/agencies"
						className="relative"
					>
						<Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							name="q"
							defaultValue={q}
							placeholder="Rechercher une agence"
							className="h-9 rounded-md border bg-background pl-8 pr-3 text-sm"
						/>
						{status !== "all" ? (
							<input
								type="hidden"
								name="status"
								value={status}
							/>
						) : null}
					</form>
					<Link
						href="/admin/agencies/new"
						className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground"
					>
						+ Créer une agence
					</Link>
				</div>
			</div>

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<p>{filteredCount === 0 ? "Aucun résultat" : `${pageStart}-${pageEnd} sur ${filteredCount} agences`}</p>
				<p>
					Tri: <span className="font-medium text-foreground">{sort}</span> ({dir})
				</p>
			</div>

			{agencies.length === 0 ? (
				<Card className="p-12 text-center">
					<Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
					<p className="text-muted-foreground">
						{status === "pending"
							? "Aucune agence en attente de validation"
							: status === "approved"
								? "Aucune agence approuvée"
								: "Aucune agence pour le moment"}
					</p>
				</Card>
			) : (
				<>
					<div className="rounded-lg border bg-white overflow-hidden">
						<Table>
							<TableHeader className="bg-[#171717]  hover:bg-[#171717] text-white hover:pointer-events-none">
								<TableRow>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={getSortHref("name")}
											label="Agence"
											active={sort === "name"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={getSortHref("city")}
											label="Localisation"
											active={sort === "city"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={getSortHref("members")}
											label="Membres"
											active={sort === "members"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={getSortHref("status")}
											label="Statut"
											active={sort === "status"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">
										<SortHeaderLink
											href={getSortHref("createdAt")}
											label="Créée le"
											active={sort === "createdAt"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border-r border-white text-center">Actions</TableHead>
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
										<TableCell className="text-center border">
											<AgencyRowActions agency={a} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{totalPages > 1 ? (
						<div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
							<Link
								href={safePage > 1 ? hrefWith({ page: safePage - 1 }) : "#"}
								className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm ${safePage > 1 ? "hover:bg-muted" : "pointer-events-none opacity-50"}`}
							>
								<ChevronLeft className="mr-1 h-4 w-4" />
								Précédent
							</Link>

							<div className="text-sm text-muted-foreground">
								Page <span className="font-medium text-foreground">{safePage}</span> / {totalPages}
							</div>

							<Link
								href={safePage < totalPages ? hrefWith({ page: safePage + 1 }) : "#"}
								className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm ${safePage < totalPages ? "hover:bg-muted" : "pointer-events-none opacity-50"}`}
							>
								Suivant
								<ChevronRight className="ml-1 h-4 w-4" />
							</Link>
						</div>
					) : null}
				</>
			)}
		</div>
	);
}
