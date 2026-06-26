import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/users/course-card";

export const metadata = {
	title: "Catalogue - AERIA Academy",
};

export default async function CoursesPage() {
	const courses = await prisma.course.findMany({
		where: { published: true },
		orderBy: { createdAt: "desc" },
		include: {
			_count: { select: { modules: true, enrollments: true } },
		},
	});

	return (
		<div className="container mx-auto px-4 py-12 space-y-8">
			<div>
				<h1 className="text-4xl font-bold">Catalogue des cours</h1>
				<p className="mt-2 text-muted-foreground">Découvre tous les cours disponibles sur AERIA Academy</p>
			</div>

			{courses.length === 0 ? (
				<div className="rounded-lg border border-dashed p-16 text-center">
					<p className="text-muted-foreground">Aucun cours disponible pour le moment.</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{courses.map((course) => (
						<CourseCard
							key={course.id}
							course={course}
						/>
					))}
				</div>
			)}
		</div>
	);
}
