import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import DashboardLayoutRight from "@/components/dashboard-layout-right";

export default async function NewLessonPage({ params }) {
	const { id: courseId, moduleId } = await params;

	const mod = await prisma.module.findUnique({
		where: { id: moduleId },
		select: { id: true, title: true, courseId: true },
	});
	if (!mod || mod.courseId !== courseId) notFound();

	return (
		<DashboardLayoutRight
			title="Nouvelle leçon"
			subtitle="Ajouter une nouvelle leçon"
			btnLabel="← Retour aux modules"
			btnLink={`/admin/courses/${courseId}/modules/${moduleId}`}
		>
			<LessonForm
				courseId={courseId}
				moduleId={moduleId}
			/>
		</DashboardLayoutRight>
	);
}
