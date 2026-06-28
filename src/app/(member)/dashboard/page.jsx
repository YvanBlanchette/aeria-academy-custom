import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CourseCard } from "@/components/users/course-card";
import { BookOpen, Award, Sparkles, Clock, TrendingUp, ArrowRight, GraduationCap } from "lucide-react";

export const metadata = { title: "Tableau de bord — AERIA Academy" };

const tierInfo = {
	FREE: { label: "Gratuit", variant: "outline" },
	ACADEMY: { label: "Académie", variant: "default" },
	PRIME: { label: "Prime", variant: "secondary" },
};

export default async function DashboardPage() {
	const session = await auth();

	// Stats + données récentes en parallèle pour la perf
	const [enrollmentCount, certificateCount, completedLessonsCount, recentEnrollments, featuredCourses, recentProgress] = await Promise.all([
		// Compte des inscriptions
		prisma.enrollment.count({
			where: { userId: session.user.id },
		}),

		// Compte des certificats
		prisma.certificate.count({
			where: { userId: session.user.id },
		}),

		// Leçons complétées
		prisma.lessonProgress.count({
			where: { userId: session.user.id, completed: true },
		}),

		// 3 derniers cours suivis (avec progression)
		prisma.enrollment.findMany({
			where: { userId: session.user.id },
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
			take: 3,
		}),

		// 3 cours qu'il pourrait découvrir (non inscrits)
		prisma.course.findMany({
			where: {
				published: true,
				enrollments: { none: { userId: session.user.id } },
			},
			take: 3,
			orderBy: { createdAt: "desc" },
		}),

		// Dernière leçon en cours (pour le "reprendre où on en était")
		prisma.lessonProgress.findFirst({
			where: { userId: session.user.id, completed: false },
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
	]);

	// Calcule la progression pour chaque cours récent
	const recentWithProgress = await Promise.all(
		recentEnrollments.map(async (enr) => {
			const totalLessons = enr.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
			const completedLessons = await prisma.lessonProgress.count({
				where: {
					userId: session.user.id,
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

	const tier = tierInfo[session.user.membership] || tierInfo.FREE;
	const firstName = session.user.name?.split(" ")[0] || "étudiant";

	return (
		<DashboardLayoutRight
			title={`Bonjour, ${firstName}`}
			subtitle="Voici ton activité sur AERIA Academy"
			user={session.user}
		>
			{/* Bandeau "Reprendre où on s'est arrêté" si applicable */}
			{recentProgress && (
				<Card className="mb-6 border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
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
							<Button asChild>
								<Link
									href={`/learn/${recentProgress.lesson.module.course.id}/${recentProgress.lesson.id}`}
									className="shrink-0"
								>
									Reprendre
									<ArrowRight className="ml-1 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-4 mb-8">
				<Card>
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

				<Card>
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

				<Card>
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

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs text-muted-foreground uppercase tracking-wider">Plan actuel</p>
								<div className="mt-2">
									<Badge
										variant={tier.variant}
										className="text-sm"
									>
										{tier.label}
									</Badge>
								</div>
							</div>
							<TrendingUp className="h-8 w-8 text-muted-foreground/40" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Mes cours en cours */}
			<section className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold">Mes cours</h2>
					{enrollmentCount > 3 && (
						<Button
							asChild
							variant="ghost"
						>
							<Link href="/dashboard/courses">Voir tout →</Link>
						</Button>
					)}
				</div>

				{recentWithProgress.length === 0 ? (
					<Card>
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
								imageClassName="group-hover:scale-105 transition-transform duration-300"
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

			{/* Cours à découvrir */}
			{featuredCourses.length > 0 && (
				<section>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-yellow-600" />
							<h2 className="text-2xl font-bold">À découvrir</h2>
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
								imageClassName="group-hover:scale-105 transition-transform duration-300"
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
		</DashboardLayoutRight>
	);
}
