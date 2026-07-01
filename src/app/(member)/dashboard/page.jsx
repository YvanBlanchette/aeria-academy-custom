import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CourseCard } from "@/components/users/course-card";
import { Award, BookOpen, CalendarClock, CheckCircle2, Clock, FileText, GraduationCap, Sparkles, TrendingUp } from "lucide-react";

export const metadata = { title: "Tableau de bord | ÆRIA Voyages Academy" };

const tierInfo = {
	FREE: { label: "Gratuit", variant: "outline" },
	ACADEMY: { label: "Académie", variant: "default" },
	PRIME: { label: "Prime", variant: "secondary" },
};

const membershipRank = {
	FREE: 0,
	ACADEMY: 1,
	PRIME: 2,
};

function safePercent(part, total) {
	if (!total || total <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
}

function countConsecutiveDays(dateRows) {
	const set = new Set(dateRows.filter((row) => row.completedAt).map((row) => new Date(row.completedAt).toISOString().slice(0, 10)));

	let streak = 0;
	const cursor = new Date();

	for (let i = 0; i < 30; i += 1) {
		const day = new Date(cursor);
		day.setDate(cursor.getDate() - i);
		const key = day.toISOString().slice(0, 10);
		if (set.has(key)) {
			streak += 1;
		} else if (streak > 0) {
			break;
		}
	}

	return streak;
}

function formatDateTime(dateValue) {
	return new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(dateValue));
}

export default async function DashboardPage() {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/login?callbackUrl=/dashboard");
	}

	const userId = session.user.id;
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const [
		enrollmentCount,
		certificateCount,
		completedLessonsCount,
		totalLessonsInEnrolledCourses,
		recentEnrollments,
		featuredCourses,
		recentProgress,
		recentArticles,
		recentCompletedRows,
		recentCertificates,
	] = await Promise.all([
		prisma.enrollment.count({
			where: { userId },
		}),
		prisma.certificate.count({
			where: { userId },
		}),
		prisma.lessonProgress.count({
			where: { userId, completed: true },
		}),
		prisma.lesson.count({
			where: {
				module: {
					course: {
						enrollments: {
							some: { userId },
						},
					},
				},
			},
		}),
		prisma.enrollment.findMany({
			where: { userId },
			include: {
				course: {
					include: {
						modules: {
							include: {
								lessons: { select: { id: true } },
							},
						},
					},
				},
			},
			orderBy: { enrolledAt: "desc" },
			take: 4,
		}),
		prisma.course.findMany({
			where: {
				published: true,
				enrollments: { none: { userId } },
			},
			take: 3,
			orderBy: { createdAt: "desc" },
		}),
		prisma.lessonProgress.findFirst({
			where: { userId, completed: false },
			orderBy: { id: "desc" },
			include: {
				lesson: {
					include: {
						module: {
							include: { course: true },
						},
					},
				},
			},
		}),
		prisma.article.findMany({
			where: { published: true },
			include: { tags: { include: { tag: true } } },
			orderBy: { publishedAt: "desc" },
			take: 6,
		}),
		prisma.lessonProgress.findMany({
			where: {
				userId,
				completed: true,
				completedAt: { gte: thirtyDaysAgo },
			},
			orderBy: { completedAt: "desc" },
			take: 30,
			select: {
				completedAt: true,
				lesson: {
					select: {
						title: true,
						module: {
							select: {
								course: {
									select: { id: true, title: true },
								},
							},
						},
					},
				},
			},
		}),
		prisma.certificate.findMany({
			where: { userId },
			orderBy: { issuedAt: "desc" },
			take: 5,
			include: { course: { select: { id: true, title: true } } },
		}),
	]);

	const recentWithProgress = await Promise.all(
		recentEnrollments.map(async (enr) => {
			const totalLessons = enr.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
			const completedLessons = await prisma.lessonProgress.count({
				where: {
					userId,
					completed: true,
					lesson: { module: { courseId: enr.course.id } },
				},
			});
			return {
				...enr,
				totalLessons,
				completedLessons,
				progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
			};
		}),
	);

	const overallProgressPercent = safePercent(completedLessonsCount, totalLessonsInEnrolledCourses);
	const streakDays = countConsecutiveDays(recentCompletedRows);
	const tier = tierInfo[session.user.membership] || tierInfo.FREE;
	const firstName = session.user.name?.split(" ")[0] || "étudiant";
	const userTierRank = membershipRank[session.user.membership] ?? 0;
	const accessibleArticles = recentArticles.filter((article) => (membershipRank[article.requiredTier] ?? 0) <= userTierRank).slice(0, 3);

	const activity = [
		...recentCompletedRows.slice(0, 5).map((row, index) => ({
			id: `lp-${index}-${row.completedAt}`,
			time: row.completedAt,
			title: `Lecon terminée: ${row.lesson.title}`,
			detail: row.lesson.module.course.title,
			href: `/learn/${row.lesson.module.course.id}`,
		})),
		...recentCertificates.map((cert) => ({
			id: `cert-${cert.id}`,
			time: cert.issuedAt,
			title: "Certificat obtenu",
			detail: cert.course.title,
			href: "/dashboard/certificates",
		})),
	]
		.filter((event) => event.time)
		.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
		.slice(0, 6);

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			<Card className="rounded-xl border bg-white shadow-sm">
				<CardContent className="p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-muted-foreground">Bonjour {firstName}</p>
							<h1 className="text-2xl font-semibold">Ton espace d&apos;apprentissage</h1>
							<p className="text-sm text-muted-foreground mt-1">Continue tes cours, suis ta progression et débloque tes certificats.</p>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant={tier.variant}>{tier.label}</Badge>
							<Button
								asChild
								variant="outline"
							>
								<Link href="/dashboard/billing">Gérer mon plan</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{recentProgress && (
				<Card className="rounded-xl border bg-white shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
								<Clock className="h-6 w-6 text-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Reprendre où tu en étais</p>
								<h3 className="font-semibold text-lg truncate">{recentProgress.lesson.module.course.title}</h3>
								<p className="text-sm text-muted-foreground truncate">
									{recentProgress.lesson.module.title} · {recentProgress.lesson.title}
								</p>
							</div>
							<Button
								asChild
								className="shrink-0"
							>
								<Link href={`/learn/${recentProgress.lesson.module.course.id}/${recentProgress.lesson.id}`}>Reprendre</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card className="shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground uppercase tracking-wider">Cours suivis</p>
								<p className="text-3xl font-bold mt-1">{enrollmentCount}</p>
							</div>
							<BookOpen className="h-8 w-8 text-muted-foreground/40" />
						</div>
					</CardContent>
				</Card>

				<Card className="shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground uppercase tracking-wider">Leçons terminées</p>
								<p className="text-3xl font-bold mt-1">{completedLessonsCount}</p>
							</div>
							<GraduationCap className="h-8 w-8 text-muted-foreground/40" />
						</div>
					</CardContent>
				</Card>

				<Card className="shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground uppercase tracking-wider">Certificats</p>
								<p className="text-3xl font-bold mt-1">{certificateCount}</p>
							</div>
							<Award className="h-8 w-8 text-muted-foreground/40" />
						</div>
					</CardContent>
				</Card>

				<Card className="shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground uppercase tracking-wider">Progression globale</p>
								<div className="mt-2">
									<p className="text-3xl font-bold">{overallProgressPercent}%</p>
									<p className="text-xs text-muted-foreground mt-1">{streakDays} jour(s) de série</p>
								</div>
							</div>
							<TrendingUp className="h-8 w-8 text-muted-foreground/40" />
						</div>
						<Progress
							value={overallProgressPercent}
							className="h-1.5 mt-4"
						/>
					</CardContent>
				</Card>
			</div>

			<section>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-semibold">Mes cours</h2>
					{enrollmentCount > 4 && (
						<Button
							asChild
							variant="ghost"
						>
							<Link href="/dashboard/courses">Voir tout →</Link>
						</Button>
					)}
				</div>

				{recentWithProgress.length === 0 ? (
					<Card className="shadow-sm">
						<CardContent className="p-12 text-center space-y-4">
							<BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto" />
							<div>
								<p className="font-medium">Aucun cours pour le moment</p>
								<p className="text-sm text-muted-foreground mt-1">Découvre notre catalogue pour commencer ton apprentissage</p>
							</div>
							<Button asChild>
								<Link href="/courses">Découvrir le catalogue</Link>
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-3">
						{recentWithProgress.map((enr) => (
							<CourseCard
								key={enr.id}
								course={enr.course}
								href={`/learn/${enr.course.id}`}
								showDefaultFooter={false}
								className="group transition-shadow hover:shadow-md"
								thumbnailClassName="-translate-y-4"
								imageClassName="transition-transform duration-300"
								contentClassName="p-4 space-y-3"
							>
								<div className="space-y-1.5">
									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground">
											{enr.completedLessons} / {enr.totalLessons} leçons
										</span>
										<span className="font-medium">{enr.progressPercent}%</span>
									</div>
									<Progress
										value={enr.progressPercent}
										className="h-1.5"
									/>
								</div>
							</CourseCard>
						))}
					</div>
				)}
			</section>

			<div className="grid gap-6 xl:grid-cols-2">
				<Card className="shadow-sm">
					<CardContent className="p-6 space-y-4">
						<div className="flex items-center gap-2">
							<CalendarClock className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-semibold">Activité récente</h2>
						</div>
						{activity.length === 0 ? (
							<p className="text-sm text-muted-foreground">Aucune activité récente pour le moment.</p>
						) : (
							<ul className="space-y-3">
								{activity.map((item) => (
									<li
										key={item.id}
										className="rounded-lg border bg-white p-3"
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="text-sm font-medium truncate">{item.title}</p>
												<p className="text-xs text-muted-foreground truncate">{item.detail}</p>
												<p className="text-[11px] text-muted-foreground mt-1">{formatDateTime(item.time)}</p>
											</div>
											<Button
												asChild
												variant="ghost"
												size="sm"
											>
												<Link href={item.href}>Voir</Link>
											</Button>
										</div>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				<Card className="shadow-sm">
					<CardContent className="p-6 space-y-4">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-semibold">Prochain objectif</h2>
						</div>
						{certificateCount === 0 ? (
							<div className="rounded-lg border bg-white p-4 space-y-2">
								<p className="font-medium">Obtenir ton premier certificat</p>
								<p className="text-sm text-muted-foreground">Termine un parcours complet pour débloquer ton certificat officiel ÆRIA.</p>
								<Button
									asChild
									size="sm"
								>
									<Link href="/dashboard/courses">Continuer mes cours</Link>
								</Button>
							</div>
						) : (
							<div className="rounded-lg border bg-white p-4 space-y-2">
								<p className="font-medium">Tu progresses très bien</p>
								<p className="text-sm text-muted-foreground">Déjà {certificateCount} certificat(s) obtenu(s). Continue pour débloquer le niveau suivant.</p>
								<Button
									asChild
									variant="outline"
									size="sm"
								>
									<Link href="/dashboard/certificates">Voir mes certificats</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{featuredCourses.length > 0 && (
				<section>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-yellow-600" />
							<h2 className="text-2xl font-semibold">À découvrir</h2>
						</div>
						<Button
							asChild
							variant="ghost"
						>
							<Link href="/courses">Voir le catalogue →</Link>
						</Button>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						{featuredCourses.map((course) => (
							<CourseCard
								key={course.id}
								course={course}
								href={`/courses/${course.slug}`}
								className="group transition-shadow hover:shadow-md"
								thumbnailClassName="-translate-y-4"
								imageClassName="transition-transform duration-300"
								contentClassName="p-4 space-y-2"
								footer={
									<div className="flex w-full items-center justify-between gap-2">
										<Badge variant={course.price === 0 ? "secondary" : "default"}>
											{course.price === 0 ? "Gratuit" : `${(course.price / 100).toFixed(2)} $`}
										</Badge>
										<span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">Découvrir →</span>
									</div>
								}
							/>
						))}
					</div>
				</section>
			)}

			{accessibleArticles.length > 0 && (
				<section>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							<h2 className="text-2xl font-semibold">Dernières ressources</h2>
						</div>
						<Button
							asChild
							variant="ghost"
						>
							<Link href="/resources">Voir tout →</Link>
						</Button>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						{accessibleArticles.map((article) => (
							<Link
								key={article.id}
								href={`/resources/${article.slug}`}
							>
								<Card className="h-full overflow-hidden border bg-white shadow-sm group hover:shadow-md transition-shadow">
									{article.coverImage && (
										<div className="aspect-video w-full overflow-hidden bg-muted -translate-y-4">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={article.coverImage}
												alt={article.title}
												className="h-full w-full object-cover transition-transform duration-300"
											/>
										</div>
									)}
									<CardContent className="p-4 space-y-2">
										<h3 className="font-semibold line-clamp-2 min-h-12">{article.title}</h3>
										{article.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
