import { cookies } from "next/headers";

import { auth } from "@/auth";
import { CourseCard } from "@/components/users/course-card";
import { canAccessCourseSync } from "@/lib/access";
import { getLocaleFromCookie } from "@/lib/locale";
import { prisma } from "@/lib/prisma";

export const metadata = {
	title: "Catalogue | ÆRIA Voyages Academy",
};

async function getPublishedCourses() {
	return prisma.course.findMany({
		where: { published: true },
		orderBy: { createdAt: "desc" },
		include: {
			_count: { select: { modules: true, enrollments: true } },
		},
	});
}

async function getEnrolledCourseIds(userId) {
	if (!userId) return [];

	const enrollments = await prisma.enrollment.findMany({
		where: { userId },
		select: { courseId: true },
	});

	return enrollments.map((enrollment) => enrollment.courseId);
}

export default async function CoursesPage() {
	// Load the session and the catalog in parallel to keep the page responsive.
	const cookieStore = await cookies();
	const locale = getLocaleFromCookie(cookieStore);
	const [session, courses] = await Promise.all([auth(), getPublishedCourses()]);

	// Fetch the user's enrollments once so each card can be evaluated efficiently.
	const enrolledCourseIds = await getEnrolledCourseIds(session?.user?.id);

	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 pb-12 pt-32 sm:px-6 lg:px-8">
			{/* Page intro. */}
			<header className="space-y-2">
				<h1 className="text-4xl font-bold">Catalogue des cours</h1>
				<p className="text-muted-foreground">Découvre tous les cours disponibles sur ÆRIA Voyages Academy</p>
			</header>

			{/* Show an empty state if no published courses are available. */}
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
								locale={locale}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
