import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { PortalReturnRefresher } from "@/components/users/portal-return-refresher";

export default async function DashboardPage() {
	const session = await auth();

	const enrollments = await prisma.enrollment.findMany({
		where: { userId: session.user.id },
		orderBy: { enrolledAt: "desc" },
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
	});

	// Calcul de progression par cours
	const enrollmentsWithProgress = await Promise.all(
		enrollments.map(async (enr) => {
			const allLessonIds = enr.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
			const completed = await prisma.lessonProgress.count({
				where: {
					userId: session.user.id,
					lessonId: { in: allLessonIds },
					completed: true,
				},
			});
			const total = allLessonIds.length;
			const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
			return { ...enr, completed, total, percent };
		}),
	);

	return (
		<div className="container mx-auto p-8 space-y-8">
			<PortalReturnRefresher />
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Mes cours</h1>
					<p className="text-muted-foreground">Bienvenue {session.user.name} 👋</p>
				</div>
			</div>

			{enrollmentsWithProgress.length === 0 ? (
				<Card>
					<CardContent className="p-16 text-center space-y-4">
						<p className="text-muted-foreground">Tu n&apos;es inscrit à aucun cours pour le moment</p>
						<Button asChild>
							<Link href="/courses">Explorer le catalogue</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{enrollmentsWithProgress.map((enr) => (
						<Card
							key={enr.id}
							className="overflow-hidden"
						>
							{enr.course.thumbnail ? (
								<div className="aspect-video w-full bg-muted">
									<Image
										width={600}
										height={400}
										src={enr.course.thumbnail}
										alt={enr.course.title}
										className="h-full w-full object-cover"
									/>
								</div>
							) : (
								<div className="aspect-video w-full bg-linear-to-br from-primary/20 to-primary/5" />
							)}
							<CardContent className="space-y-4 p-6">
								<div>
									<h3 className="font-bold line-clamp-2">{enr.course.title}</h3>
								</div>
								<div className="space-y-1.5">
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Progression</span>
										<span>
											{enr.completed} / {enr.total} leçons
										</span>
									</div>
									<Progress value={enr.percent} />
								</div>
								{enr.percent === 100 && (
									<Badge
										variant="secondary"
										className="bg-green-100 text-green-700"
									>
										Terminé 🎉
									</Badge>
								)}
								<Button
									asChild
									className="w-full"
								>
									<Link href={`/learn/${enr.courseId}`}>{enr.percent === 0 ? "Commencer" : "Continuer"}</Link>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
