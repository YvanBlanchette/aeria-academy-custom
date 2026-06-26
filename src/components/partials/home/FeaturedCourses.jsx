import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/users/course-card";

const FeaturedCourses = async () => {
	const featuredCourses = await prisma.course.findMany({
		where: { published: true },
		take: 3,
		orderBy: { createdAt: "desc" },
		include: {
			_count: { select: { modules: true, enrollments: true } },
		},
	});

	return (
		<div className="container mx-auto px-4 py-12 space-y-16">
			{featuredCourses.length > 0 && (
				<section className="space-y-6">
					<div className="flex items-end justify-between">
						<h2 className="text-3xl font-bold">Cours en vedette</h2>
						<Link
							href="/courses"
							className="text-sm text-primary hover:underline"
						>
							Voir tout →
						</Link>
					</div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{featuredCourses.map((course) => (
							<CourseCard
								key={course.id}
								course={course}
							/>
						))}
					</div>
				</section>
			)}
		</div>
	);
};
export default FeaturedCourses;
