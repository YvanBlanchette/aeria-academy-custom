import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/users/course-card";
import { ArrowRight } from "lucide-react";

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
		<div className="container max-w-7xl mx-auto px-4 space-y-12 pb-12">
			{featuredCourses.length > 0 && (
				<section className="space-y-6">
					<div className="flex items-start justify-between">
						<div className="space-y-2 flex flex-col mb-6">
							<p className="uppercase tracking-widest text-xs font-semibold text-yellow-600">Recommandations de l&apos;académie</p>
							<h2 className="font-display text-3xl lg:text-5xl font-bold">Cours en vedette</h2>
							<span className="h-0.5 w-36 bg-linear-to-r from-yellow-600 via-yellow-400 to-yellow-800" />
						</div>
						<Link
							href="/courses"
							className="text-sm text-primary hover:underline flex items-center"
						>
							Voir tout
							<ArrowRight className="inline-block ml-2 w-4 h-4" />
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
