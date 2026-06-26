import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "@/components/admin/course-form";
import { ModuleManager } from "@/components/admin/module-manager";
import DashboardLayoutRight from "@/components/dashboard-layout-right";

export default async function EditCoursePage({ params }) {
	const { id } = await params;
	console.log(id);

	const course = await prisma.course.findUnique({
		where: { id },
		include: {
			modules: {
				orderBy: { order: "asc" },
				include: {
					_count: { select: { lessons: true } },
					quiz: { select: { id: true } },
				},
			},
		},
	});

	const metadata = {
		title: course.title,
		subtitle: "Gérez les cours de l'Académie",
		btnLabel: "← Retour aux cours",
		btnLink: "/admin/courses",
	};

	if (!course) notFound();

	return (
		<DashboardLayoutRight
			title={metadata.title}
			subtitle={metadata.subtitle}
		>
			<div className="flex justify-between gap-8 h-full">
				<CourseForm course={course} />

				<ModuleManager course={course} />
			</div>
		</DashboardLayoutRight>
	);
}
