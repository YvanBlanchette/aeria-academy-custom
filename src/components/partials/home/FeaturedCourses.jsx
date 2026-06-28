import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CourseCard } from "@/components/users/course-card";
import { dict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

async function getFeaturedCourses() {
	// Fetch the most recent published courses to promote on the homepage.
	return prisma.course.findMany({
		where: { published: true },
		take: 3,
		orderBy: { createdAt: "desc" },
		include: {
			// Include counts so the cards can display module and enrollment information.
			_count: { select: { modules: true, enrollments: true } },
		},
	});
}

export default async function FeaturedCourses({ locale = "fr" }) {
	// Load the featured courses once on the server before rendering the section.
	const featuredCourses = await getFeaturedCourses();
	const t = dict[locale]?.articles ?? dict.fr?.articles;

	// Avoid rendering an empty section when there are no published courses.
	if (featuredCourses.length === 0) {
		return null;
	}

	return (
		<section className="mx-auto max-w-7xl space-y-6 px-4 py-8 pb-12 sm:px-6 sm:py-12 lg:px-8">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-col space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-600">{t?.sectionLabel ?? "Academy Lessons"}</p>
					<h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">{t?.sectionTitle ?? "Latest Lessons"}</h2>
					<span className="h-0.5 w-36 bg-linear-to-r from-yellow-600 via-yellow-400 to-yellow-800" />
				</div>

				{/* Give users a quick path to the full catalog. */}
				<Link
					href="/courses"
					className="flex items-center self-start text-sm text-primary transition-colors hover:underline"
				>
					{t?.viewAll ?? "View All Lessons"}
					<ArrowRight className="ml-2 h-4 w-4" />
				</Link>
			</header>

			{/* Render the featured cards in a responsive grid. */}
			<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
				{featuredCourses.map((course) => (
					<CourseCard
						key={course.id}
						course={course}
					/>
				))}
			</div>
		</section>
	);
}
