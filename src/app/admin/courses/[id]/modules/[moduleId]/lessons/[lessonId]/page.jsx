import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";
import DashboardLayoutRight from "@/components/dashboard-layout-right";
import { Card } from "@/components/ui/card";

export default async function EditLessonPage({ params }) {
	const { id: courseId, moduleId, lessonId } = await params;

	const lesson = await prisma.lesson.findUnique({
		where: { id: lessonId },
		include: { module: { select: { id: true, title: true, courseId: true } } },
	});
	if (!lesson || lesson.moduleId !== moduleId || lesson.module.courseId !== courseId) notFound();

	return (
		<DashboardLayoutRight
			title="Modifier la leçon"
			subtitle="Modifier une leçon existante"
			btnLabel="← Retour aux modules"
			btnLink={`/admin/courses/${courseId}/modules/${moduleId}`}
		>
			<Card className="w-full p-6">
				<LessonForm
					courseId={courseId}
					moduleId={moduleId}
					lesson={lesson}
				/>
			</Card>
		</DashboardLayoutRight>
	);
}
