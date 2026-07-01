import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CourseCard } from "@/components/users/course-card";
import { CoursesViewToggle } from "@/components/users/courses-view-toggle";
import { markdownToExcerpt } from "@/lib/markdown-excerpt";
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Search } from "lucide-react";

export const metadata = { title: "Mes cours | ÆRIA Voyages Academy" };

const PAGE_SIZE = 9;
const SORT_FIELDS = ["recent", "progress", "title", "enrolledAt"];
const VIEW_MODES = ["cards", "list"];
const VIEW_COOKIE_NAME = "dashboard_courses_view";

function parseParams(params, fallbackView = "cards") {
	const q = typeof params?.q === "string" ? params.q.trim() : "";
	const status = params?.status === "in_progress" || params?.status === "completed" || params?.status === "not_started" ? params.status : "all";
	const sort = SORT_FIELDS.includes(params?.sort) ? params.sort : "recent";
	const dir = params?.dir === "asc" || params?.dir === "desc" ? params.dir : "desc";
	const view = VIEW_MODES.includes(params?.view) ? params.view : fallbackView;
	const parsedPage = Number(params?.page);
	const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
	return { q, status, sort, dir, view, page };
}

function SortHeaderLink({ href, label, active, dir }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
		>
			<span>{label}</span>
			{active ? dir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5" />}
		</Link>
	);
}

function computeNextLesson(courseModules, completedSet) {
	for (const mod of courseModules) {
		for (const lesson of mod.lessons) {
			if (!completedSet.has(lesson.id)) return lesson.id;
		}
	}
	return null;
}

function courseStatus(progressPercent, completedLessons) {
	if (progressPercent >= 100) return "completed";
	if (completedLessons <= 0) return "not_started";
	return "in_progress";
}

export default async function MyCoursesPage({ searchParams }) {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?callbackUrl=/dashboard/courses");
	}

	const params = await searchParams;
	const cookieStore = await cookies();
	const cookieView = cookieStore.get(VIEW_COOKIE_NAME)?.value;
	const fallbackView = VIEW_MODES.includes(cookieView) ? cookieView : "cards";
	const { q, status, sort, dir, view, page } = parseParams(params, fallbackView);
	const userId = session.user.id;

	const enrollments = await prisma.enrollment.findMany({
		where: {
			userId,
			...(q
				? {
						course: {
							OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
						},
					}
				: {}),
		},
		include: {
			course: {
				include: {
					_count: { select: { modules: true, enrollments: true } },
					modules: {
						orderBy: { order: "asc" },
						include: {
							lessons: {
								orderBy: { order: "asc" },
								select: { id: true },
							},
						},
					},
				},
			},
		},
		orderBy: { enrolledAt: "desc" },
	});

	const courseIds = enrollments.map((enr) => enr.course.id);

	const progressRows =
		courseIds.length > 0
			? await prisma.lessonProgress.findMany({
					where: {
						userId,
						lesson: {
							module: {
								courseId: { in: courseIds },
							},
						},
					},
					select: {
						completed: true,
						completedAt: true,
						lesson: {
							select: {
								id: true,
								module: { select: { courseId: true } },
							},
						},
					},
				})
			: [];

	const progressMap = new Map();
	for (const row of progressRows) {
		const courseId = row.lesson.module.courseId;
		if (!progressMap.has(courseId)) {
			progressMap.set(courseId, {
				completedLessonIds: new Set(),
				lastCompletedAt: null,
			});
		}
		const bucket = progressMap.get(courseId);
		if (row.completed) {
			bucket.completedLessonIds.add(row.lesson.id);
			if (row.completedAt && (!bucket.lastCompletedAt || row.completedAt > bucket.lastCompletedAt)) {
				bucket.lastCompletedAt = row.completedAt;
			}
		}
	}

	const courseItems = enrollments.map((enr) => {
		const course = enr.course;
		const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
		const progress = progressMap.get(course.id);
		const completedSet = progress?.completedLessonIds || new Set();
		const completedLessons = completedSet.size;
		const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
		const statusKey = courseStatus(progressPercent, completedLessons);
		const nextLessonId = computeNextLesson(course.modules, completedSet);
		const continueHref = nextLessonId ? `/learn/${course.id}/${nextLessonId}` : `/learn/${course.id}`;

		return {
			enrollmentId: enr.id,
			enrolledAt: enr.enrolledAt,
			course,
			totalLessons,
			completedLessons,
			progressPercent,
			statusKey,
			continueHref,
			lastActivityAt: progress?.lastCompletedAt || enr.enrolledAt,
		};
	});

	const filteredItems = status === "all" ? courseItems : courseItems.filter((item) => item.statusKey === status);

	filteredItems.sort((a, b) => {
		const direction = dir === "asc" ? 1 : -1;
		if (sort === "progress") return (a.progressPercent - b.progressPercent) * direction;
		if (sort === "title") return a.course.title.localeCompare(b.course.title, "fr") * direction;
		if (sort === "enrolledAt") return (new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime()) * direction;
		return (new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime()) * direction;
	});

	const totalFiltered = filteredItems.length;
	const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * PAGE_SIZE;
	const pageItems = filteredItems.slice(start, start + PAGE_SIZE);

	const totalLessonsAll = courseItems.reduce((sum, item) => sum + item.totalLessons, 0);
	const completedLessonsAll = courseItems.reduce((sum, item) => sum + item.completedLessons, 0);
	const completedCoursesCount = courseItems.filter((item) => item.statusKey === "completed").length;
	const averageProgress = totalLessonsAll > 0 ? Math.round((completedLessonsAll / totalLessonsAll) * 100) : 0;

	function hrefWith(next) {
		const merged = { q, status, sort, dir, view, page, ...next };
		const usp = new URLSearchParams();
		if (merged.q) usp.set("q", merged.q);
		if (merged.status && merged.status !== "all") usp.set("status", merged.status);
		if (merged.sort && merged.sort !== "recent") usp.set("sort", merged.sort);
		if (merged.dir && merged.dir !== "desc") usp.set("dir", merged.dir);
		if (merged.view && merged.view !== "cards") usp.set("view", merged.view);
		if (merged.page && Number(merged.page) > 1) usp.set("page", String(merged.page));
		const qs = usp.toString();
		return qs ? `/dashboard/courses?${qs}` : "/dashboard/courses";
	}

	function sortHref(column) {
		const isCurrent = sort === column;
		const nextDir = isCurrent && dir === "asc" ? "desc" : "asc";
		return hrefWith({ sort: column, dir: nextDir, page: 1 });
	}

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-lg border bg-card p-4">
					<p className="text-xs text-muted-foreground">Cours inscrits</p>
					<p className="mt-2 text-3xl font-bold">{courseItems.length}</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<p className="text-xs text-muted-foreground">Cours terminés</p>
					<p className="mt-2 text-3xl font-bold">{completedCoursesCount}</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<p className="text-xs text-muted-foreground">Leçons complétées</p>
					<p className="mt-2 text-3xl font-bold">{completedLessonsAll}</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<p className="text-xs text-muted-foreground">Progression moyenne</p>
					<p className="mt-2 text-3xl font-bold">{averageProgress}%</p>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-3 space-y-3">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap gap-2 items-center">
						<Link
							href={hrefWith({ status: "all", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Tous
						</Link>
						<Link
							href={hrefWith({ status: "in_progress", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === "in_progress" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							En cours
						</Link>
						<Link
							href={hrefWith({ status: "completed", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === "completed" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Terminés
						</Link>
						<Link
							href={hrefWith({ status: "not_started", page: 1 })}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${status === "not_started" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"}`}
						>
							Non commencés
						</Link>
						<div className="h-5 w-px bg-border mx-1" />
						<CoursesViewToggle
							currentView={view}
							cardsHref={hrefWith({ view: "cards", page: 1 })}
							listHref={hrefWith({ view: "list", page: 1 })}
						/>
					</div>

					<form
						action="/dashboard/courses"
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
						{view !== "cards" ? (
							<input
								type="hidden"
								name="view"
								value={view}
							/>
						) : null}
					</form>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<SortHeaderLink
						href={sortHref("recent")}
						label="Activité"
						active={sort === "recent"}
						dir={dir}
					/>
					<SortHeaderLink
						href={sortHref("progress")}
						label="Progression"
						active={sort === "progress"}
						dir={dir}
					/>
					<SortHeaderLink
						href={sortHref("title")}
						label="Titre"
						active={sort === "title"}
						dir={dir}
					/>
					<SortHeaderLink
						href={sortHref("enrolledAt")}
						label="Inscription"
						active={sort === "enrolledAt"}
						dir={dir}
					/>
				</div>
			</div>

			{courseItems.length === 0 ? (
				<Card>
					<CardContent className="p-12 text-center space-y-4">
						<BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto" />
						<p className="text-muted-foreground">Tu n&apos;es inscrit à aucun cours pour le moment.</p>
						<Button asChild>
							<Link href="/courses">Découvrir le catalogue</Link>
						</Button>
					</CardContent>
				</Card>
			) : pageItems.length === 0 ? (
				<Card>
					<CardContent className="p-10 text-center space-y-3">
						<p className="text-muted-foreground">Aucun cours ne correspond à tes filtres.</p>
						<Button
							asChild
							variant="outline"
						>
							<Link href="/dashboard/courses">Réinitialiser les filtres</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<>
					{view === "cards" ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{pageItems.map((item) => (
								<CourseCard
									key={item.enrollmentId}
									course={item.course}
									href={item.continueHref}
									showDefaultFooter={false}
									contentClassName="p-6 space-y-3"
								>
									<p className="text-sm text-muted-foreground line-clamp-2">{markdownToExcerpt(item.course.description, 140)}</p>
									<div className="space-y-1.5">
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">
												{item.completedLessons} / {item.totalLessons} leçons
											</span>
											<span className="font-medium">{item.progressPercent}%</span>
										</div>
										<Progress
											value={item.progressPercent}
											className="h-1.5"
										/>
									</div>
									<div className="flex items-center justify-between">
										<Badge variant={item.statusKey === "completed" ? "default" : item.statusKey === "in_progress" ? "secondary" : "outline"}>
											{item.statusKey === "completed" ? (
												<span className="inline-flex items-center gap-1">
													<CheckCircle2 className="h-3.5 w-3.5" /> Terminé
												</span>
											) : item.statusKey === "in_progress" ? (
												<span className="inline-flex items-center gap-1">
													<CalendarClock className="h-3.5 w-3.5" /> En cours
												</span>
											) : (
												"À commencer"
											)}
										</Badge>
										<span className="inline-flex items-center text-sm font-medium text-primary">Continuer →</span>
									</div>
								</CourseCard>
							))}
						</div>
					) : (
						<div className="rounded-lg border bg-card divide-y">
							{pageItems.map((item) => (
								<div
									key={item.enrollmentId}
									className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
								>
									<div className="min-w-0 space-y-2">
										<Link
											href={item.continueHref}
											className="font-semibold hover:underline line-clamp-1"
										>
											{item.course.title}
										</Link>
										<p className="text-sm text-muted-foreground line-clamp-2">{markdownToExcerpt(item.course.description, 160)}</p>
										<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
											<span>
												{item.completedLessons} / {item.totalLessons} leçons
											</span>
											<span>•</span>
											<span>Inscrit le {new Date(item.enrolledAt).toLocaleDateString("fr-FR")}</span>
										</div>
										<Progress
											value={item.progressPercent}
											className="h-1.5"
										/>
									</div>

									<div className="flex items-center gap-2 md:pl-4">
										<Badge variant={item.statusKey === "completed" ? "default" : item.statusKey === "in_progress" ? "secondary" : "outline"}>
											{item.statusKey === "completed" ? "Terminé" : item.statusKey === "in_progress" ? "En cours" : "À commencer"}
										</Badge>
										<Button
											asChild
											size="sm"
										>
											<Link href={item.continueHref}>Continuer</Link>
										</Button>
									</div>
								</div>
							))}
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
