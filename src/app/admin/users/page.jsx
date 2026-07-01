import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { renameUserRole } from "@/lib/helpers";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, Shield, Sparkles, Users } from "lucide-react";

const PAGE_SIZE = 15;
const SORT_FIELDS = ["name", "email", "role", "membership", "emailVerified", "createdAt"];

function parseParams(params) {
	const q = typeof params?.q === "string" ? params.q.trim() : "";
	const role = ["STUDENT", "INSTRUCTOR", "ADMIN"].includes(params?.role) ? params.role : "all";
	const membership = ["FREE", "ACADEMY", "PRIME"].includes(params?.membership) ? params.membership : "all";
	const verified = params?.verified === "yes" || params?.verified === "no" ? params.verified : "all";
	const sort = SORT_FIELDS.includes(params?.sort) ? params.sort : "createdAt";
	const dir = params?.dir === "asc" || params?.dir === "desc" ? params.dir : "desc";
	const rawPage = Number(params?.page);
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
	return { q, role, membership, verified, sort, dir, page };
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

function membershipBadgeVariant(tier) {
	if (tier === "PRIME") return "default";
	if (tier === "ACADEMY") return "secondary";
	return "outline";
}

export default async function UsersPage({ searchParams }) {
	const session = await auth();
	const params = await searchParams;
	const { q, role, membership, verified, sort, dir, page } = parseParams(params);

	const where = {
		...(role !== "all" ? { role } : {}),
		...(membership !== "all" ? { membership } : {}),
		...(verified === "yes" ? { emailVerified: { not: null } } : verified === "no" ? { emailVerified: null } : {}),
		...(q
			? {
					OR: [
						{ name: { contains: q, mode: "insensitive" } },
						{ email: { contains: q, mode: "insensitive" } },
						{ username: { contains: q, mode: "insensitive" } },
					],
				}
			: {}),
	};

	const orderBy =
		sort === "name"
			? [{ name: dir }, { createdAt: "desc" }]
			: sort === "email"
				? [{ email: dir }, { createdAt: "desc" }]
				: sort === "role"
					? [{ role: dir }, { createdAt: "desc" }]
					: sort === "membership"
						? [{ membership: dir }, { createdAt: "desc" }]
						: sort === "emailVerified"
							? [{ emailVerified: dir }, { createdAt: "desc" }]
							: [{ createdAt: dir }];

	const [users, filteredCount, totalCount, verifiedCount, adminCount, instructorCount, paidCount] = await Promise.all([
		prisma.user.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			include: {
				_count: {
					select: {
						enrollments: true,
						progress: true,
						quizAttempts: true,
						certificates: true,
					},
				},
			},
		}),
		prisma.user.count({ where }),
		prisma.user.count(),
		prisma.user.count({ where: { emailVerified: { not: null } } }),
		prisma.user.count({ where: { role: "ADMIN" } }),
		prisma.user.count({ where: { role: "INSTRUCTOR" } }),
		prisma.user.count({ where: { membership: { in: ["ACADEMY", "PRIME"] } } }),
	]);

	const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageStart = filteredCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
	const pageEnd = Math.min(safePage * PAGE_SIZE, filteredCount);

	function hrefWith(next) {
		const merged = {
			q,
			role,
			membership,
			verified,
			sort,
			dir,
			page,
			...next,
		};
		const usp = new URLSearchParams();
		if (merged.q) usp.set("q", merged.q);
		if (merged.role !== "all") usp.set("role", merged.role);
		if (merged.membership !== "all") usp.set("membership", merged.membership);
		if (merged.verified !== "all") usp.set("verified", merged.verified);
		if (merged.sort !== "createdAt") usp.set("sort", merged.sort);
		if (merged.dir !== "desc") usp.set("dir", merged.dir);
		if (Number(merged.page) > 1) usp.set("page", String(merged.page));
		const qs = usp.toString();
		return qs ? `/admin/users?${qs}` : "/admin/users";
	}

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Membres</p>
						<Users className="h-4 w-4 text-primary" />
					</div>
					<p className="mt-2 text-3xl font-bold">{totalCount}</p>
				</div>
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Emails vérifiés</p>
						<Shield className="h-4 w-4 text-primary" />
					</div>
					<p className="mt-2 text-3xl font-bold">{verifiedCount}</p>
				</div>
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Equipe</p>
						<Sparkles className="h-4 w-4 text-primary" />
					</div>
					<p className="mt-2 text-sm font-medium">
						{adminCount} admins • {instructorCount} instructeurs
					</p>
				</div>
				<div className="rounded-lg border bg-white p-4 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Abonnés payants</p>
						<Badge variant="outline">tiers</Badge>
					</div>
					<p className="mt-2 text-3xl font-bold">{paidCount}</p>
				</div>
			</div>

			<h2 className="text-3xl font-bold text-center">Liste des membres</h2>

			<div className="space-y-3 rounded-lg border bg-white p-3">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap justify-start items-center gap-2">
						<Link
							href={hrefWith({ role: "all", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${role === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Tous
						</Link>
						<Link
							href={hrefWith({ role: "STUDENT", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${role === "STUDENT" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Étudiants
						</Link>
						<Link
							href={hrefWith({ role: "INSTRUCTOR", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${role === "INSTRUCTOR" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Instructeurs
						</Link>
						<Link
							href={hrefWith({ role: "ADMIN", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${role === "ADMIN" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Admins
						</Link>
						<Link
							href={hrefWith({ membership: "ACADEMY", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${membership === "ACADEMY" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							ACADEMY
						</Link>
						<Link
							href={hrefWith({ membership: "PRIME", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${membership === "PRIME" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							PRIME
						</Link>
						<Link
							href={hrefWith({ verified: "yes", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${verified === "yes" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Email vérifié
						</Link>
					</div>

					<div className="flex justify-end items-center gap-2">
						<form
							action="/admin/users"
							className="relative"
						>
							<Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<input
								type="text"
								name="q"
								defaultValue={q}
								placeholder="Rechercher un membre"
								className="h-9 rounded-md border bg-background pl-8 pr-3 text-sm"
							/>
							{role !== "all" ? (
								<input
									type="hidden"
									name="role"
									value={role}
								/>
							) : null}
							{membership !== "all" ? (
								<input
									type="hidden"
									name="membership"
									value={membership}
								/>
							) : null}
							{verified !== "all" ? (
								<input
									type="hidden"
									name="verified"
									value={verified}
								/>
							) : null}
						</form>
						<Link
							href="/admin/users/new"
							className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground"
						>
							+ Ajouter un membre
						</Link>
					</div>
				</div>
			</div>

			{users.length === 0 ? (
				<Card className="p-12 text-center text-muted-foreground">Aucun membre pour ces filtres.</Card>
			) : (
				<>
					<div className="bg-white border rounded-lg overflow-hidden">
						<Table>
							<TableHeader className="bg-[#171717]  hover:bg-[#171717] text-white hover:pointer-events-none">
								<TableRow>
									<TableHead className="text-white border border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "name", dir: sort === "name" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Nom"
											active={sort === "name"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "role", dir: sort === "role" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Rôle"
											active={sort === "role"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "membership", dir: sort === "membership" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Membership"
											active={sort === "membership"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "email", dir: sort === "email" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Courriel"
											active={sort === "email"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "emailVerified", dir: sort === "emailVerified" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Vérifié"
											active={sort === "emailVerified"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-white border border-white text-center">Stats</TableHead>
									<TableHead className="text-white border border-white text-center">
										<SortHeaderLink
											href={hrefWith({ sort: "createdAt", dir: sort === "createdAt" && dir === "asc" ? "desc" : "asc", page: 1 })}
											label="Inscrit"
											active={sort === "createdAt"}
											dir={dir}
										/>
									</TableHead>
									<TableHead className="text-center text-white">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="text-center border">
											<Link
												href={`/admin/users/${user.id}`}
												className="font-medium hover:underline"
											>
												{user.name || "Sans nom"}
											</Link>
											{user.username ? <p className="text-xs text-muted-foreground">@{user.username}</p> : null}
										</TableCell>
										<TableCell className="text-center border">
											<Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{renameUserRole(user.role)}</Badge>
										</TableCell>
										<TableCell className="text-center border">
											<Badge variant={membershipBadgeVariant(user.membership)}>{user.membership}</Badge>
										</TableCell>
										<TableCell className="text-center border">{user.email}</TableCell>
										<TableCell className="text-center border">
											<Badge variant={user.emailVerified ? "default" : "outline"}>{user.emailVerified ? "Oui" : "Non"}</Badge>
										</TableCell>
										<TableCell className="text-center border">
											<p className="text-xs">
												{user._count.enrollments} cours • {user._count.certificates} certifs
											</p>
										</TableCell>
										<TableCell className="text-center border">
											{new Date(user.createdAt).toLocaleDateString("fr-FR", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
											})}
										</TableCell>
										<TableCell className="text-center border">
											<UserRowActions
												user={user}
												isSelf={user.id === session?.user?.id}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<div className="flex items-center justify-between gap-3">
						<p className="text-sm text-muted-foreground">
							Page {safePage} / {totalPages}
						</p>
						<div className="flex gap-2">
							<Button
								asChild
								variant="outline"
								size="sm"
								disabled={safePage <= 1}
							>
								<Link href={hrefWith({ page: Math.max(1, safePage - 1) })}>
									<ChevronLeft className="mr-1 h-4 w-4" />
									Précédent
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="sm"
								disabled={safePage >= totalPages}
							>
								<Link href={hrefWith({ page: Math.min(totalPages, safePage + 1) })}>
									Suivant
									<ChevronRight className="ml-1 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
