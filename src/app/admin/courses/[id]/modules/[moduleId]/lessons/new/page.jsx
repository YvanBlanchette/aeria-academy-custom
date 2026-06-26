import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LessonForm } from "@/components/admin/lesson-form";

export default async function NewLessonPage({ params }) {
	const { id: courseId, moduleId } = await params;

	const mod = await prisma.module.findUnique({
		where: { id: moduleId },
		select: { id: true, title: true, courseId: true },
	});
	if (!mod || mod.courseId !== courseId) notFound();

	return (
		<div className="space-y-6">
			<div>
				<Link
					href={`/admin/courses/${courseId}/modules/${moduleId}`}
					className="text-sm text-muted-foreground hover:underline"
				>
					← {mod.title}
				</Link>
				<h1 className="mt-2 text-3xl font-bold">Nouvelle leçon</h1>
			</div>
			<LessonForm
				courseId={courseId}
				moduleId={moduleId}
			/>
		</div>
	);
}
