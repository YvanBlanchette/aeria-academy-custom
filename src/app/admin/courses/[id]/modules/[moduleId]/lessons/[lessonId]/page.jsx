import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";

export default async function EditLessonPage({ params }) {
	const { id: courseId, moduleId, lessonId } = await params;

	const lesson = await prisma.lesson.findUnique({
		where: { id: lessonId },
		include: { module: { select: { id: true, title: true, courseId: true } } },
	});
	if (!lesson || lesson.moduleId !== moduleId || lesson.module.courseId !== courseId) notFound();

	return (
		<div className="space-y-6">
			<div>
				<Link
					href={`/admin/courses/${courseId}/modules/${moduleId}`}
					className="text-sm text-muted-foreground hover:underline"
				>
					← {lesson.module.title}
				</Link>
				<h1 className="mt-2 text-3xl font-bold">Modifier la leçon</h1>
			</div>
			<LessonForm
				courseId={courseId}
				moduleId={moduleId}
				lesson={lesson}
			/>
		</div>
	);
}
