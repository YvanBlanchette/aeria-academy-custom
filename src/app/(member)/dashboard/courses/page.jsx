import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/users/course-card";
import { markdownToExcerpt } from "@/lib/markdown-excerpt";

export const metadata = { title: "Mes cours | ÆRIA Voyages Academy" };

export default async function MyCoursesPage() {
	const session = await auth();

	const enrollments = await prisma.enrollment.findMany({
		where: { userId: session.user.id },
		include: {
			course: {
				include: {
					_count: { select: { modules: true } },
				},
			},
		},
		orderBy: { enrolledAt: "desc" },
	});

	return (
		<div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-neutral-100">
			{enrollments.length === 0 ? (
				<Card>
					<CardContent className="p-12 text-center space-y-4">
						<p className="text-muted-foreground">Tu n&apos;es inscrit à aucun cours pour le moment.</p>
						<Button asChild>
							<Link href="/courses">Découvrir le catalogue</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{enrollments.map((enr) => (
						<CourseCard
							key={enr.id}
							course={enr.course}
							href={`/learn/${enr.course.id}`}
							showDefaultFooter={false}
							contentClassName="p-6 space-y-3"
						>
							<p className="text-sm text-muted-foreground line-clamp-2">{markdownToExcerpt(enr.course.description, 140)}</p>
							<span className="inline-flex items-center text-sm font-medium text-primary">Continuer →</span>
						</CourseCard>
					))}
				</div>
			)}
		</div>
	);
}
