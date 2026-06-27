import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canAccessCourseSync } from "@/lib/access";
import { CourseCard } from "@/components/users/course-card";

export const metadata = {
	title: "Catalogue | ÆRIA Voyages Academy",
};

export default async function CoursesPage() {
	const [session, courses] = await Promise.all([
		auth(),
		prisma.course.findMany({
			where: { published: true },
			orderBy: { createdAt: "desc" },
			include: {
				_count: { select: { modules: true, enrollments: true } },
			},
		}),
	]);

	// Précharge les enrollments de l'user pour éviter N+1 requêtes
	let enrolledCourseIds = [];
	if (session) {
		const enrollments = await prisma.enrollment.findMany({
			where: { userId: session.user.id },
			select: { courseId: true },
		});
		enrolledCourseIds = enrollments.map((e) => e.courseId);
	}

	return (
		<div className="container mx-auto px-4 pt-32 pb-12 space-y-8">
			<div>
				<h1 className="text-4xl font-bold">Catalogue des cours</h1>
				<p className="mt-2 text-muted-foreground">Découvre tous les cours disponibles sur ÆRIA Voyages Academy</p>
			</div>

			{courses.length === 0 ? (
				<div className="rounded-lg border border-dashed p-16 text-center">
					<p className="text-muted-foreground">Aucun cours disponible pour le moment.</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{courses.map((course) => {
						const access = canAccessCourseSync(session?.user, course, enrolledCourseIds);
						const isEnrolled = enrolledCourseIds.includes(course.id);
						return (
							<CourseCard
								key={course.id}
								course={course}
								userHasAccess={access.allowed}
								userIsEnrolled={isEnrolled}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
