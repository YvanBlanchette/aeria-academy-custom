import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import { markdownToExcerpt } from "@/lib/markdown-excerpt";
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, ChevronLeft, ChevronRight, CircleDollarSign, GraduationCap, Search, Sparkles } from "lucide-react";

const PAGE_SIZE = 12;
const SORT_FIELDS = ["title", "status", "type", "price", "modules", "enrollments", "createdAt"];

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

function parseFilterParams(params) {
	const q = typeof params?.q === "string" ? params.q.trim() : "";
	const status = params?.status === "published" || params?.status === "draft" ? params.status : "all";
	const pricing = params?.pricing === "free" || params?.pricing === "paid" ? params.pricing : "all";
	const sort = SORT_FIELDS.includes(params?.sort) ? params.sort : "createdAt";
	const dir = params?.dir === "asc" || params?.dir === "desc" ? params.dir : "desc";
	const parsedPage = Number(params?.page);
	const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
	return { q, status, pricing, sort, dir, page };
}

export default async function CoursesListPage({ searchParams }) {
	const params = await searchParams;
	const { q, status, pricing, sort, dir, page } = parseFilterParams(params);

	const where = {
		...(status === "published" ? { published: true } : status === "draft" ? { published: false } : {}),
		...(pricing === "free" ? { price: 0 } : pricing === "paid" ? { price: { gt: 0 } } : {}),
		...(q
			? {
					OR: [
						{ title: { contains: q, mode: "insensitive" } },
						{ description: { contains: q, mode: "insensitive" } },
						{ slug: { contains: q, mode: "insensitive" } },
					],
				}
			: {}),
	};

	const orderBy =
		sort === "title"
			? [{ title: dir }, { createdAt: "desc" }]
			: sort === "status"
				? [{ published: dir }, { createdAt: "desc" }]
				: sort === "type"
					? [{ price: dir }, { createdAt: "desc" }]
					: sort === "price"
						? [{ price: dir }, { createdAt: "desc" }]
						: sort === "modules"
							? [{ modules: { _count: dir } }, { createdAt: "desc" }]
							: sort === "enrollments"
								? [{ enrollments: { _count: dir } }, { createdAt: "desc" }]
								: [{ createdAt: dir }];

	const [courses, filteredCoursesCount, totalCourses, publishedCourses, draftCourses, freeCourses, paidCourses, enrollmentsTotal] = await Promise.all([
		prisma.course.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			include: {
				_count: { select: { modules: true, enrollments: true } },
			},
		}),
		prisma.course.count({ where }),
		prisma.course.count(),
		prisma.course.count({ where: { published: true } }),
		prisma.course.count({ where: { published: false } }),
		prisma.course.count({ where: { price: 0 } }),
		prisma.course.count({ where: { price: { gt: 0 } } }),
		prisma.enrollment.count(),
	]);

	const totalPages = Math.max(1, Math.ceil(filteredCoursesCount / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pageStart = filteredCoursesCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
	const pageEnd = Math.min(safePage * PAGE_SIZE, filteredCoursesCount);

	function hrefWith(next) {
		const merged = {
			q,
			status,
			pricing,
			sort,
			dir,
			page,
			...next,
		};
		const usp = new URLSearchParams();
		if (merged.q) usp.set("q", merged.q);
		if (merged.status && merged.status !== "all") usp.set("status", merged.status);
		if (merged.pricing && merged.pricing !== "all") usp.set("pricing", merged.pricing);
		if (merged.sort && merged.sort !== "createdAt") usp.set("sort", merged.sort);
		if (merged.dir && merged.dir !== "desc") usp.set("dir", merged.dir);
		if (merged.page && Number(merged.page) > 1) usp.set("page", String(merged.page));
		const qs = usp.toString();
		return qs ? `/admin/courses?${qs}` : "/admin/courses";
	}

	function getSortHref(column) {
		const isCurrent = sort === column;
		const nextDir = isCurrent && dir === "asc" ? "desc" : "asc";
		return hrefWith({ sort: column, dir: nextDir, page: 1 });
	}

	const stats = [
		{ label: "Cours total", value: totalCourses, icon: BookOpen },
		{ label: "Publiés", value: publishedCourses, icon: Sparkles },
		{ label: "Inscriptions", value: enrollmentsTotal, icon: GraduationCap },
		{ label: "Monétisation", value: `${paidCourses}/${freeCourses}`, icon: CircleDollarSign },
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

			<div className="space-y-4">
				<h2 className="text-3xl font-bold text-center">Liste des cours</h2>

				<div className="flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap gap-2">
						<Link
							href={hrefWith({ status: "all" })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								status === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Tous
						</Link>
						<Link
							href={hrefWith({ status: "published" })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								status === "published" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Publiés
						</Link>
						<Link
							href={hrefWith({ status: "draft" })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								status === "draft" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Brouillons
						</Link>
						<Link
							href={hrefWith({ pricing: "free" })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								pricing === "free" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Gratuits
						</Link>
						<Link
							href={hrefWith({ pricing: "paid" })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								pricing === "paid" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
							}`}
						>
							Payants
						</Link>
					</div>

					<div className="flex items-center gap-2">
						<form
							action="/admin/courses"
							className="relative"
						>
							<Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<input
								type="text"
								name="q"
								defaultValue={q}
								placeholder="Rechercher un cours"
								className="h-9 rounded-md border bg-background pl-8 pr-3 text-sm"
							/>
							{status !== "all" ? (
								<input
									type="hidden"
									name="status"
									value={status}
								/>
							) : null}
							{pricing !== "all" ? (
								<input
									type="hidden"
									name="pricing"
									value={pricing}
								/>
							) : null}
						</form>
						<Link
							href="/admin/courses/new"
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground`}
						>
							+ Créer un cours
						</Link>
					</div>
				</div>

				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<p>{filteredCoursesCount === 0 ? "Aucun résultat" : `${pageStart}-${pageEnd} sur ${filteredCoursesCount} cours`}</p>
					<p>
						Tri: <span className="font-medium text-foreground">{sort}</span> ({dir})
					</p>
				</div>

				{courses.length === 0 ? (
					<div className="rounded-lg border border-dashed p-12 text-center">
						<p className="text-muted-foreground">Aucun cours pour le moment</p>
						<Button
							asChild
							className="mt-4"
						>
							<Link href="/admin/courses/new">Créer le premier cours</Link>
						</Button>
					</div>
				) : (
					<>
						<div className="bg-white border rounded-lg overflow-hidden">
							<Table>
								<TableHeader className="bg-[#171717]  hover:bg-[#171717] text-white hover:pointer-events-none">
									<TableRow>
										<TableHead className="text-white border-r border-white text-center">
											<SortHeaderLink
												href={getSortHref("title")}
												label="Titre"
												active={sort === "title"}
												dir={dir}
											/>
										</TableHead>
										<TableHead className="text-white border border-white text-center">
											<SortHeaderLink
												href={getSortHref("status")}
												label="Statut"
												active={sort === "status"}
												dir={dir}
											/>
										</TableHead>
										<TableHead className="text-white border border-white text-center">
											<SortHeaderLink
												href={getSortHref("type")}
												label="Type"
												active={sort === "type"}
												dir={dir}
											/>
										</TableHead>
										<TableHead className="text-white border border-white text-center">
											<SortHeaderLink
												href={getSortHref("price")}
												label="Prix"
												active={sort === "price"}
												dir={dir}
											/>
										</TableHead>
										<TableHead className="text-white border border-white text-center">
											<SortHeaderLink
												href={getSortHref("modules")}
												label="Modules"
												active={sort === "modules"}
												dir={dir}
											/>
										</TableHead>
										<TableHead className="text-white border border-white text-center">
											<SortHeaderLink
												href={getSortHref("enrollments")}
												label="Inscrits"
												active={sort === "enrollments"}
												dir={dir}
											/>
										</TableHead>
										<TableHead className="text-white border border-white text-center">
											<SortHeaderLink
												href={getSortHref("createdAt")}
												label="Créé le"
												active={sort === "createdAt"}
												dir={dir}
											/>
										</TableHead>
										<TableHead className="text-center text-white">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{courses.map((course) => (
										<TableRow key={course.id}>
											<TableCell className="text-center border">
												<Link
													href={`/admin/courses/${course.id}`}
													className="font-medium hover:underline"
												>
													{course.title}
												</Link>
												<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{markdownToExcerpt(course.description, 140)}</p>
											</TableCell>
											<TableCell className="text-center border">
												<Badge variant={course.published ? "default" : "secondary"}>{course.published ? "Publié" : "Brouillon"}</Badge>
											</TableCell>
											<TableCell className="text-center border">
												<Badge variant={course.price > 0 ? "default" : "outline"}>{course.price > 0 ? "Payant" : "Gratuit"}</Badge>
											</TableCell>
											<TableCell className="text-center border">{(course.price / 100).toFixed(2)} $</TableCell>
											<TableCell className="text-center border">{course._count.modules}</TableCell>
											<TableCell className="text-center border">{course._count.enrollments}</TableCell>
											<TableCell className="text-center border">{new Date(course.createdAt).toLocaleDateString("fr-CA")}</TableCell>
											<TableCell className="text-center border">
												<CourseRowActions course={course} />
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
		</div>
	);
}
